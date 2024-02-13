import React, { useState } from 'react';
import { Editor, EditorState, RichUtils, getDefaultKeyBinding, Modifier, SelectionState } from 'draft-js';
import 'draft-js/dist/Draft.css';
import styles from './style.module.css'

const EditorPage = () => {
  const [editorState, setEditorState] = useState(() => EditorState.createEmpty());

  const onChange = (newEditorState) => {
    setEditorState(newEditorState);
  };

  const moveFocusToEnd=(editorState)=> {
    editorState = EditorState.moveSelectionToEnd(editorState);
    return EditorState.forceSelection(editorState, editorState.getSelection());
}


  const handleKeyCommand = (command) => {
    if (command === 'convert-to-heading') {
      convertToHeading();
      return 'handled';
    }

    if (command === 'convert-to-red') {
      convertToRed();
      return 'handled';
    }

    const newState = RichUtils.handleKeyCommand(editorState, command);

    if (newState) {
      onChange(newState);
      return 'handled';
    }

    return 'not-handled';
  };

  const keyBindingFn = (e) => {
    if (e.keyCode === 32 && e.target.textContent.startsWith('#')) {
      return 'convert-to-heading';
    }
    if (e.keyCode === 32 && e.target.textContent.startsWith('*')) {
      return 'convert-to-red';
    }
    return getDefaultKeyBinding(e);
  };

  const convertToHeading = () => {
    const selection = editorState.getSelection();
    const contentState = editorState.getCurrentContent();
    const blockKey = selection.getStartKey();
    const block = contentState.getBlockForKey(blockKey);
    const blockText = block.getText();

    // Check if the current block is a paragraph and starts with #
    if (blockText.trim().startsWith('#')) {
      const newText = blockText.substring(1); // Remove the "#" and space
      // console.log('newText', newText);
      const newContentState = Modifier.replaceText(
        contentState,
        selection.merge({
          anchorOffset: 0,
          focusOffset: blockText.length // Remove only the "#" and space
        }),
        newText
      );

      // Convert the block to header-one
      const updatedContentState = Modifier.setBlockType(
        newContentState,
        selection,
        'header-one'
      );

      // Apply red color to the text
      // const contentWithRedColor = Modifier.applyInlineStyle(
      //   updatedContentState,
      //   selection,
      //   'RED'
      // );

      // Update the editor state
      const newEditorState = EditorState.push(editorState, updatedContentState, 'change-block-type');

    
      const finalEditorState = moveFocusToEnd(newEditorState);

      onChange(finalEditorState);
    }
  };

  const convertToRed = ()=>{

    const selection = editorState.getSelection();
    const contentState = editorState.getCurrentContent();
    const blockKey = selection.getStartKey();
    const block = contentState.getBlockForKey(blockKey);
    const blockText = block.getText();


    if(blockText.trim().startsWith('*')){
      const newText = blockText.substring(1); // Remove the "*" and space
      console.log('newText', newText);
      const newContentState = Modifier.replaceText(
        contentState,
        selection.merge({
          anchorOffset: 0,
          focusOffset: blockText.length // Remove only the "*" and space
        }),
        newText
      );


       const contentWithRedColor = Modifier.applyInlineStyle(
        newContentState,
        selection,
        styles.red
      );

      const newEditorState = EditorState.push(editorState, contentWithRedColor, 'change-block-type');

    
      const finalEditorState = moveFocusToEnd(newEditorState);

      onChange(finalEditorState);
      
    }
  }

  return (
    <div className={styles.main_container}>
      <div className={styles.heading}>Demo editor by <span className={styles.name}>Mahak Bharatkar</span>
      <button>Save</button>
       </div>
      <div style={{ border: '1px solid #252525', minHeight: '200px', padding: '10px',borderRadius: '0.5rem', }}>
        <Editor
          editorState={editorState}
          onChange={onChange}
          handleKeyCommand={handleKeyCommand}
          keyBindingFn={keyBindingFn}
          placeholder='Write here...'
        />
      </div>
    </div>
  );
};

export default EditorPage;
