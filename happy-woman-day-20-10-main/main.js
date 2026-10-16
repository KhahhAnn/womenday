onload = () => {
  const c = setTimeout(() => {
    document.body.classList.remove("not-loaded");
    clearTimeout(c);
  }, 1000);

  const giftTrigger = document.getElementById("giftTrigger");
  const likeModal = document.getElementById("likeModal");
  const likeModalBackdrop = document.getElementById("likeModalBackdrop");
  const likeActions = document.getElementById("likeActions");
  const likeSuccess = document.getElementById("likeSuccess");
  const btnYes = document.getElementById("btnYes");
  const btnNo = document.getElementById("btnNo");

  if (!giftTrigger || !likeModal || !btnNo || !btnYes) return;

  let noEscapingEnabled = false;

  const isMobile = () => window.matchMedia("(max-width: 600px)").matches;

  const getViewport = () => {
    const vv = window.visualViewport;
    if (!vv) {
      return {
        left: 0,
        top: 0,
        width: window.innerWidth,
        height: window.innerHeight,
      };
    }
    return {
      left: vv.offsetLeft,
      top: vv.offsetTop,
      width: vv.width,
      height: vv.height,
    };
  };

  const getEdgePad = () => (isMobile() ? 10 : 16);

  const resetNoButton = () => {
    btnNo.style.position = "";
    btnNo.style.left = "";
    btnNo.style.top = "";
    btnNo.style.zIndex = "";
    btnNo.classList.remove("like-btn--escaped");
  };

  const clampNoButton = () => {
    if (btnNo.style.position !== "fixed") return;

    const pad = getEdgePad();
    const vv = getViewport();
    const rect = btnNo.getBoundingClientRect();
    const w = rect.width;
    const h = rect.height;

    let x = parseFloat(btnNo.style.left) || rect.left;
    let y = parseFloat(btnNo.style.top) || rect.top;

    const minX = vv.left + pad;
    const minY = vv.top + pad;
    const maxX = vv.left + vv.width - w - pad;
    const maxY = vv.top + vv.height - h - pad;

    x = Math.min(Math.max(x, minX), Math.max(minX, maxX));
    y = Math.min(Math.max(y, minY), Math.max(minY, maxY));

    btnNo.style.left = `${x}px`;
    btnNo.style.top = `${y}px`;
  };

  const moveNoButton = () => {
    const pad = getEdgePad();
    const vv = getViewport();
    const rect = btnNo.getBoundingClientRect();
    const w = rect.width || btnNo.offsetWidth;
    const h = rect.height || btnNo.offsetHeight;

    const minX = vv.left + pad;
    const minY = vv.top + pad;
    const maxX = vv.left + vv.width - w - pad;
    const maxY = vv.top + vv.height - h - pad;

    const spanX = Math.max(0, maxX - minX);
    const spanY = Math.max(0, maxY - minY);
    const x = minX + Math.random() * spanX;
    const y = minY + Math.random() * spanY;

    btnNo.style.position = "fixed";
    btnNo.style.left = `${x}px`;
    btnNo.style.top = `${y}px`;
    btnNo.style.zIndex = "10001";
    btnNo.classList.add("like-btn--escaped");
    noEscapingEnabled = true;
  };

  const isChoiceStepOpen = () =>
    !likeModal.classList.contains("like-modal--hidden") &&
    !likeActions.classList.contains("like-modal__actions--hidden");

  const pointerNearNo = (clientX, clientY) => {
    const rect = btnNo.getBoundingClientRect();
    const pad = isMobile() ? 40 : 28;
    return (
      clientX >= rect.left - pad &&
      clientX <= rect.right + pad &&
      clientY >= rect.top - pad &&
      clientY <= rect.bottom + pad
    );
  };

  const tryEscapeNo = (clientX, clientY, isTouch) => {
    if (!isChoiceStepOpen()) return;
    if (!isTouch && !noEscapingEnabled) return;
    if (pointerNearNo(clientX, clientY)) moveNoButton();
  };

  const openModal = () => {
    likeModal.classList.remove("like-modal--hidden");
    likeModal.setAttribute("aria-hidden", "false");
    likeActions.classList.remove("like-modal__actions--hidden");
    likeSuccess.classList.add("like-modal__success--hidden");
    noEscapingEnabled = false;
    resetNoButton();
    document.body.classList.add("like-modal-open");
  };

  const closeModal = () => {
    likeModal.classList.add("like-modal--hidden");
    likeModal.setAttribute("aria-hidden", "true");
    noEscapingEnabled = false;
    resetNoButton();
    document.body.classList.remove("like-modal-open");
  };

  giftTrigger.addEventListener("click", openModal);
  likeModalBackdrop.addEventListener("click", closeModal);

  btnNo.addEventListener("mouseenter", moveNoButton);
  btnNo.addEventListener("mouseover", moveNoButton);
  btnNo.addEventListener("mousedown", (e) => {
    e.preventDefault();
    moveNoButton();
  });

  btnNo.addEventListener("pointerdown", (e) => {
    if (e.pointerType === "mouse") return;
    e.preventDefault();
    moveNoButton();
  });

  btnNo.addEventListener("click", (e) => {
    e.preventDefault();
    e.stopPropagation();
    moveNoButton();
  });

  document.addEventListener("mousemove", (e) => {
    tryEscapeNo(e.clientX, e.clientY, false);
  });

  document.addEventListener(
    "touchstart",
    (e) => {
      if (!isChoiceStepOpen()) return;
      for (let i = 0; i < e.changedTouches.length; i += 1) {
        const touch = e.changedTouches[i];
        if (pointerNearNo(touch.clientX, touch.clientY)) {
          e.preventDefault();
          moveNoButton();
          return;
        }
      }
    },
    { passive: false, capture: true },
  );

  document.addEventListener(
    "touchmove",
    (e) => {
      if (!isChoiceStepOpen()) return;
      const touch = e.touches[0];
      if (!touch) return;
      tryEscapeNo(touch.clientX, touch.clientY, true);
    },
    { passive: true, capture: true },
  );

  likeActions.addEventListener(
    "pointermove",
    (e) => {
      if (e.pointerType !== "touch") return;
      tryEscapeNo(e.clientX, e.clientY, true);
    },
    { passive: true },
  );

  window.visualViewport?.addEventListener("resize", clampNoButton);
  window.visualViewport?.addEventListener("scroll", clampNoButton);

  btnYes.addEventListener("click", () => {
    likeActions.classList.add("like-modal__actions--hidden");
    likeSuccess.classList.remove("like-modal__success--hidden");
    resetNoButton();
  });
};
