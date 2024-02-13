import React, { useState } from "react";
import {
  Editor,
  EditorState,
  RichUtils,
  getDefaultKeyBinding,
  Modifier,
  SelectionState,
  convertToRaw,
} from "draft-js";
import "draft-js/dist/Draft.css";
import styles from "./styles.module.css";
const EditorPage = () => {
  const [editorState, setEditorState] = useState(() =>
    EditorState.createEmpty()
  );
  const [isSaving, setIsSaving] = useState(false);

  const onChange = (newEditorState) => {
    setEditorState(newEditorState);

    // Save to local storage
    localStorage.setItem(
      "SavedContent",
      JSON.stringify(convertToRaw(newEditorState.getCurrentContent()))
    );
  };

  const moveFocusToEnd = (editorState) => {
    editorState = EditorState.moveSelectionToEnd(editorState);
    return EditorState.forceSelection(editorState, editorState.getSelection());
  };

  const handleKeyCommand = (command) => {
    if (command === "convert-to-heading") {
      convertToHeading();
      return "handled";
    } else if (command === "RED") {
      convertToInline(command, "**");
      return "handled";
    } else if (command === "BOLD") {
      convertToInline(command, "*");
      return "handled";
    } else if (command === "UNDERLINE") {
      convertToInline(command, "***");
      return "handled";
    }

    const newState = RichUtils.handleKeyCommand(editorState, command);

    if (newState) {
      onChange(newState);
      return "handled";
    }

    return "not-handled";
  };

  const keyBindingFn = (e) => {
    if (e.keyCode === 32 && e.target.textContent.startsWith("#")) {
      return "convert-to-heading";
    } else if (e.keyCode === 32 && e.target.textContent.startsWith("*")) {
      return "BOLD";
    } else if (e.keyCode === 32 && e.target.textContent.startsWith("**")) {
      return "RED";
    } else if (e.keyCode === 32 && e.target.textContent.startsWith("***")) {
      return "UNDERLINE";
    }
    return getDefaultKeyBinding(e);
  };

  const removeMarkerAndApplyBlocktype = (startString, selection) => {
    const contentState = editorState.getCurrentContent();
    const blockKey = selection.getStartKey();
    const block = contentState.getBlockForKey(blockKey);
    const blockText = block.getText();

    let newContentState = {};

    if (blockText.trim().startsWith(startString)) {
      const markerLength = startString.length;
      const newText = blockText.substring(markerLength); // Remove the startString and space
      newContentState = Modifier.replaceText(
        contentState,
        selection.merge({
          anchorOffset: 0,
          focusOffset: blockText.length, // Remove only the "#" and space
        }),
        newText
      );
    }

    return newContentState;
  };

  const convertToHeading = () => {
    const selection = editorState.getSelection();

    const newContentState = removeMarkerAndApplyBlocktype("#", selection);

    // Convert the block to header-one
    const updatedContentState = Modifier.setBlockType(
      newContentState,
      selection,
      "header-one"
    );

    // Update the editor state
    const newEditorState = EditorState.push(
      editorState,
      updatedContentState,
      "change-block-type"
    );

    const finalEditorState = moveFocusToEnd(newEditorState);

    onChange(finalEditorState);
  };

  const convertToInline = (command, startMarker) => {
    const selection = editorState.getSelection();
    const newContentState = removeMarkerAndApplyBlocktype(
      startMarker,
      selection
    );

    // Apply inline style to the text
    const contentWithInlineStyle = Modifier.applyInlineStyle(
      newContentState,
      selection,
      styles[command]
    );

    const newEditorState = EditorState.push(
      editorState,
      contentWithInlineStyle,
      "change-block-type"
    );

    const finalEditorState = moveFocusToEnd(newEditorState);

    onChange(finalEditorState);
  };

  return (
    <div className={styles.main_container}>
      <div className={styles.heading}>
        <div>
          Demo editor by <span className={styles.name}>
            Mahak Bharatkar
          </span>
        </div>

        <button
          onClick={() => setIsSaving(!isSaving)}
          className={styles.button}
          disabled={isSaving}
        >
          {isSaving ? "Saved" : "Save"}
        </button>

      </div>

      <div
        style={{
          border: "1px solid #252525",
          minHeight: "200px",
          padding: "10px",
          borderRadius: "0.5rem",
        }}
      >
        <Editor
          editorState={editorState}
          onChange={onChange}
          handleKeyCommand={handleKeyCommand}
          keyBindingFn={keyBindingFn}
          placeholder="Write here..."
        />
      </div>
    </div>
  );
};

export default EditorPage;
