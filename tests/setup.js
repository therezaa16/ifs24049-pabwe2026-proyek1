const dialogOpener = new WeakMap();

if (!HTMLDialogElement.prototype.showModal) {
  HTMLDialogElement.prototype.showModal = function showModal() {
    dialogOpener.set(this, document.activeElement);
    this.setAttribute('open', '');
    (this.querySelector('[autofocus]') || this).focus();
  };
}

if (!HTMLDialogElement.prototype.close) {
  HTMLDialogElement.prototype.close = function close() {
    this.removeAttribute('open');
    const opener = dialogOpener.get(this);
    if (opener?.isConnected) opener.focus();
  };
}
