class ToastManager {
  constructor(defaultOptions = {}) {
    this.defaultOptions = {
      duration: 3000,
      gravity: "top",
      position: "center",
      close: true,
      stopOnFocus: true,
      style: {
        borderRadius: "8px",
        fontSize: "16px",
        marginTop: "6px",
      },
      ...defaultOptions,
    };
  }

  show(message, type = "info") {
    let backgroundColor;

    switch (type) {
      case "success":
        backgroundColor = "#4caf50";
        break;
      case "error":
        backgroundColor = "#f44336";
        break;
      case "warning":
        backgroundColor = "#ff9800";
        break;
      default:
        backgroundColor = "#2196f3"; // info
    }

    Toastify({
      text: message,
      backgroundColor,
      ...this.defaultOptions,
    }).showToast();
  }
}

export const toast = new ToastManager();
