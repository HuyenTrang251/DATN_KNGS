import { createContext, useContext, useEffect, useMemo, useRef, useState } from "react";
import { Button, Form, Modal } from "react-bootstrap";

const AppDialogContext = createContext(null);

const defaultDialogState = {
  open: false,
  type: "alert",
  title: "Thông báo",
  message: "",
  confirmText: "OK",
  cancelText: "",
  defaultValue: "",
};

let alertBridge = (message) => Promise.resolve();
let confirmBridge = () => Promise.resolve(false);
let promptBridge = () => Promise.resolve(null);

export const appAlert = (message, options = {}) => alertBridge(message, options);
export const appConfirm = (message, options = {}) => confirmBridge(message, options);
export const appPrompt = (message, options = {}) => promptBridge(message, options);

export function AppDialogProvider({ children }) {
  const resolverRef = useRef(null);
  const [dialogState, setDialogState] = useState(defaultDialogState);
  const [promptValue, setPromptValue] = useState("");

  const closeDialog = (result) => {
    const resolver = resolverRef.current;
    resolverRef.current = null;
    setDialogState(defaultDialogState);
    setPromptValue("");
    if (resolver) resolver(result);
  };

  const openDialog = (type, message, options = {}) =>
    new Promise((resolve) => {
      resolverRef.current = resolve;
      setPromptValue(options.defaultValue ?? "");
      setDialogState({
        open: true,
        type,
        title: options.title || "Thông báo",
        message: String(message ?? ""),
        confirmText:
          options.confirmText || (type === "alert" ? "Đóng" : type === "prompt" ? "Xác nhận" : "OK"),
        cancelText:
          options.cancelText || (type === "alert" ? "" : type === "prompt" ? "Hủy" : "Hủy"),
        defaultValue: options.defaultValue ?? "",
        placeholder: options.placeholder || "",
      });
    });

  useEffect(() => {
    alertBridge = (message, options) => openDialog("alert", message, options);
    confirmBridge = (message, options) => openDialog("confirm", message, options);
    promptBridge = (message, options) => openDialog("prompt", message, options);

    const nativeAlert = window.alert;
    window.alert = (message) => {
      alertBridge(message);
    };

    return () => {
      alertBridge = (message) => Promise.resolve(message);
      confirmBridge = () => Promise.resolve(false);
      promptBridge = () => Promise.resolve(null);
      window.alert = nativeAlert;
    };
  }, []);

  const contextValue = useMemo(
    () => ({
      alert: appAlert,
      confirm: appConfirm,
      prompt: appPrompt,
    }),
    []
  );

  return (
    <AppDialogContext.Provider value={contextValue}>
      {children}

      <Modal show={dialogState.open} onHide={() => closeDialog(dialogState.type === "alert" ? undefined : dialogState.type === "prompt" ? null : false)} centered>
        <Modal.Header closeButton>
          <Modal.Title className="fw-bold">{dialogState.title}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <div style={{ whiteSpace: "pre-line" }}>{dialogState.message}</div>
          {dialogState.type === "prompt" && (
            <Form.Control
              autoFocus
              className="mt-3"
              value={promptValue}
              placeholder={dialogState.placeholder}
              onChange={(e) => setPromptValue(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  closeDialog(promptValue);
                }
              }}
            />
          )}
        </Modal.Body>
        <Modal.Footer>
          {dialogState.cancelText && (
            <Button
              variant="secondary"
              onClick={() => closeDialog(dialogState.type === "prompt" ? null : false)}
            >
              {dialogState.cancelText}
            </Button>
          )}
          <Button
            variant="primary"
            onClick={() => closeDialog(dialogState.type === "confirm" ? true : dialogState.type === "prompt" ? promptValue : undefined)}
          >
            {dialogState.confirmText}
          </Button>
        </Modal.Footer>
      </Modal>
    </AppDialogContext.Provider>
  );
}

export function useAppDialog() {
  const context = useContext(AppDialogContext);
  if (!context) {
    throw new Error("useAppDialog must be used within AppDialogProvider");
  }
  return context;
}



