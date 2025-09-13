// import { useEffect, useRef } from "react";
// import Codemirror from "codemirror";
// import "codemirror/lib/codemirror.css";
// import "codemirror/mode/javascript/javascript";
// import "codemirror/theme/dracula.css";
// import "codemirror/addon/edit/closetag";
// import "codemirror/addon/edit/closebrackets";
// import ACTIONS from "../Actions";

// const Editor = ({ socketRef, roomId }) => {
//   const editorRef = useRef(null);
//   const textareaRef = useRef(null);

//   useEffect(() => {
//     if (editorRef.current === null) {
//       editorRef.current = Codemirror.fromTextArea(textareaRef.current, {
//         mode: { name: "javascript", json: true },
//         theme: "dracula",
//         autoCloseTags: true,
//         autoCloseBrackets: true,
//         lineNumbers: true,
//       });
//     }

//     // Editor change event
//     editorRef.current.on("change", (instance, changes) => {
//       console.log(socketRef);
//       const { origin } = changes;
//       const code = instance.getValue();
//       console.log("[EDITOR_CHANGE]", origin, code);
//       if (origin !== "setValue" && socketRef.current) {
//         console.log("working", code);
//         socketRef.current.emit(ACTIONS.CODE_CHANGE, { roomId, code });
//       }
//     });

//     if(socketRef.current) {
//       socketRef.current.on(ACTIONS.CODE_CHANGE, ({ code }) => {
//       if (code !== null) {
//         editorRef.current.setValue(code);
//       }
//     });
//     }

//     return () => {
//       if (editorRef.current) {
//         editorRef.current.toTextArea();
//         editorRef.current = null;
//       }
//     };
//   }, [roomId, socketRef]);

//   // useEffect(() => {
//   //   if (socketRef.current) {
//   //     socketRef.current.on(ACTIONS.CODE_CHANGE, ({ code }) => {
//   //       console.log("recieving", code);
//   //       if (code !== null) {
//   //         editorRef.current.setValue(code);
//   //       }
//   //     });
//   //   }
//   // }, [socketRef]);

//   return <textarea ref={textareaRef} id="realtimeEditor" />;
// };

// export default Editor;

// import { useEffect, useRef } from "react";
// import Codemirror from "codemirror";
// import "codemirror/lib/codemirror.css";
// import "codemirror/mode/javascript/javascript";
// import "codemirror/theme/dracula.css";
// import "codemirror/addon/edit/closetag";
// import "codemirror/addon/edit/closebrackets";
// import ACTIONS from "../Actions";

// const Editor = ({ roomId, socketRef }) => {
//   const editorRef = useRef(null);
//   const textareaRef = useRef(null);

//   // 1️⃣ Setup editor once
//   useEffect(() => {
//     if (!editorRef.current) {
//       editorRef.current = Codemirror.fromTextArea(textareaRef.current, {
//         mode: { name: "javascript", json: true },
//         theme: "dracula",
//         autoCloseTags: true,
//         autoCloseBrackets: true,
//         lineNumbers: true,
//       });
//     }

//     // Editor -> Emit changes to server
//     editorRef.current.on("change", (instance, changes) => {
//       const { origin } = changes;
//       console.log("Attaching listener for event:", ACTIONS.CODE_CHANGE);
//       const code = instance.getValue();
//       if (origin !== "setValue" && socketRef.current) {
//         console.log("[CLIENT->SERVER] sending code:", code);
//         socketRef.current.emit(ACTIONS.CODE_CHANGE, { roomId, code });
//       }
//     });

//     return () => {
//       if (editorRef.current) {
//         editorRef.current.toTextArea();
//         editorRef.current = null;
//       }
//     };
//   }, [roomId, socketRef]);

//   useEffect(() => {
//     if (!socketRef.current) return;

//     const currentSocket = socketRef.current;

//     const handler = ({ code }) => {
//       console.log("[SERVER -> CLIENT] CODE SEND SUCCESSFULLY!");
//       if (code !== null && code !== editorRef.current.getValue()) {
//         editorRef.current.setValue(code); // ✅ fixed
//       }
//     };

//     currentSocket.on(ACTIONS.CODE_CHANGE, handler);
//     return () => currentSocket.off(ACTIONS.CODE_CHANGE, handler);
//   }, [socketRef]);

//   return <textarea ref={textareaRef} id="realtimeEditor" />;
// };

// export default Editor;


// **************************************************** second fixed code *******************************************************//
import { useEffect, useRef } from "react";
import Codemirror from "codemirror";
import "codemirror/lib/codemirror.css";
import "codemirror/mode/javascript/javascript";
import "codemirror/theme/dracula.css";
import "codemirror/addon/edit/closetag";
import "codemirror/addon/edit/closebrackets";
import ACTIONS from "../Actions";

const Editor = ({ roomId, socketRef, onCodeChange }) => {
  const editorRef = useRef(null);
  const textareaRef = useRef(null);

  // 1️⃣ Setup editor once
  useEffect(() => {
    if (!editorRef.current) {
      editorRef.current = Codemirror.fromTextArea(textareaRef.current, {
        mode: { name: "javascript", json: true },
        theme: "dracula",
        autoCloseTags: true,
        autoCloseBrackets: true,
        lineNumbers: true,
      });

      // ❌ Wrong: was inside effect with deps → re-attached on every render
      // ✅ Fixed: attach change listener once when editor is created
      editorRef.current.on("change", (instance, changes) => {
        const { origin } = changes;
        const code = instance.getValue();
        onCodeChange(code);
        if (origin !== "setValue" && socketRef.current) {
          console.log("[CLIENT->SERVER] sending code:", code);
          socketRef.current.emit(ACTIONS.CODE_CHANGE, { roomId, code });
        }
      });
    }

    return () => {
      if (editorRef.current) {
        editorRef.current.toTextArea();
        editorRef.current = null;
      }
    };
  }, [roomId, socketRef]); // ✅ depends on roomId and socketRef

  // 2️⃣ Handle incoming code updates
  useEffect(() => {
    if (!socketRef.current) return;
    const currentSocket = socketRef.current;

    const handler = ({ code }) => {
      console.log("[SERVER -> CLIENT] received code:", code);
      if (
        code !== null &&
        editorRef.current &&
        code !== editorRef.current.getValue()
      ) {
        editorRef.current.setValue(code);
      }
    };

    currentSocket.on(ACTIONS.CODE_CHANGE, handler);

    return () => {
      currentSocket.off(ACTIONS.CODE_CHANGE, handler);
    };
  }, [socketRef]);

  return <textarea ref={textareaRef} id="realtimeEditor" />;
};

export default Editor;
