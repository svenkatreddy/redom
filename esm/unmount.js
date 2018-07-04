import { getEl } from './util.js';
import { trigger } from './mount.js';

export const unmount = (parent, child) => {
  const parentEl = getEl(parent);
  const childEl = getEl(child);

  if (child === childEl && childEl.__redom_view) {
    // try to look up the view if not provided
    child = childEl.__redom_view;
  }

  if (childEl.parentNode) {
    doUnmount(child, childEl, parentEl);

    parentEl.removeChild(childEl);
  }

  return child;
};

export const doUnmount = (child, childEl, parentEl) => {
  const hooks = childEl.__redom_lifecycle;

  if (hooksAreEmpty(hooks)) {
    childEl.__redom_mounted = false;
    return;
  }

  let traverse = parentEl;

  if (childEl.__redom_mounted) {
    trigger(childEl, 'onunmount');
  }

  while (traverse) {
    const parentHooks = traverse.__redom_lifecycle || {};

    for (const hook in hooks) {
      if (parentHooks[hook]) {
        parentHooks[hook] -= hooks[hook];
      }
    }

    if (hooksAreEmpty(parentHooks)) {
      traverse.__redom_lifecycle = null;
    }

    traverse = traverse.parentNode;
  }
};

const hooksAreEmpty = (hooks) => {
  return !hooks || !Object.keys(hooks).filter(hook => hooks[hook]).length;
};