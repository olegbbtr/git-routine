let container: HTMLElement | null = null;

function getContainer(): HTMLElement {
  if (!container) {
    container = document.createElement('div');
    container.className = 'toast-container';
    document.body.appendChild(container);
  }
  return container;
}

export function showToast(message: string, type: 'error' | 'success' = 'error', persistent = false): void {
  const el = document.createElement('div');
  el.className = `toast toast-${type}`;

  const text = document.createElement('span');
  text.textContent = message;
  el.appendChild(text);

  if (persistent) {
    const close = document.createElement('button');
    close.className = 'toast-close u-icon';
    close.innerHTML = '✕';
    close.onclick = () => {
      el.classList.add('toast-out');
      el.addEventListener('transitionend', () => el.remove());
    };
    el.appendChild(close);
  } else {
    setTimeout(() => {
      el.classList.add('toast-out');
      el.addEventListener('transitionend', () => el.remove());
    }, 3000);
  }

  getContainer().appendChild(el);
}
