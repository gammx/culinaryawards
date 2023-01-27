import React from 'react';
import * as DialogPrimitive from '@radix-ui/react-dialog';
import cn from 'classnames';

interface DialogContentProps extends React.ComponentProps<typeof DialogPrimitive.Content> {
  title: string;
  description: string;
}

interface DialogActionsProps extends React.HTMLProps<HTMLDivElement> { }

const DialogContent = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Content>,
  DialogContentProps
>(({ title, description, children, ...props }, forwardedRef) => (
  <DialogPrimitive.Portal>
    <DialogPrimitive.Overlay className="fixed inset-0 bg-black bg-opacity-50" />
    <DialogPrimitive.Content
      className="bg-white rounded p-4 fixed top-2/4 left-2/4 -translate-x-2/4 -translate-y-2/4 w-64"
      ref={forwardedRef}
      aria-label="Dialog"
      {...props}
    >
      <div className="flex items-center justify-between">
        <DialogPrimitive.Title className="text-lg font-bold">
          {title}
        </DialogPrimitive.Title>
        <DialogPrimitive.Close className="text-gray-600">
          <svg
            className="w-4 h-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M6 18L18 6M6 6l12 12"
            ></path>
          </svg>
        </DialogPrimitive.Close>
      </div>
      <DialogPrimitive.Description className="mt-1 text-sm mb-2.5">
        {description}
      </DialogPrimitive.Description>
      {children}
    </DialogPrimitive.Content>
  </DialogPrimitive.Portal>
));

const DialogActions: React.FC<DialogActionsProps> = ({
  children,
  className,
  ...props
}) => {
  return (
    <div
      className={cn("flex justify-end mt-4", className)}
      {...props}
    >
      {children}
    </div>
  );
};

export default {
  Root: DialogPrimitive.Root,
  Content: DialogContent,
  Trigger: DialogPrimitive.Trigger,
  Actions: DialogActions,
};
