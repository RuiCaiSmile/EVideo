import { createPortal } from 'react-dom';

export const PortalRender = (props: any) => {
  const { visible, parentID = 'document.body', ID, children } = props;
  const appendTo =
    parentID === 'document.body'
      ? document.body
      : document.querySelector(`#${parentID}`);
  return visible && appendTo
    ? createPortal(<div id={ID}>{children}</div>, appendTo)
    : null;
};
