import { useState, useLayoutEffect, useRef } from 'react';

/**
 * @param formHandlerCallbackHOF {function} - higher-order function which returns form handler
 * @param placeholder {string} - place holder for comment textarea field
 * @param initialContents {string} - initial contents is used when user modify existing comment
 * @param closeCallback {function} - callback is called when user clicks cancel button or user submits comment form successfully
 * @param disabled {boolean} - is form disabled
 */
function CommentForm({
  placeholder = '',
  initialContents = '',
  formHandlerCallbackHOF,
  closeCallback,
  disabled = false,
}: {
  placeholder?: string;
  initialContents?: string;
  formHandlerCallbackHOF: (contents: string) => () => Promise<void>;
  closeCallback?: () => void;
  disabled?: boolean;
}): any {
  const [contents, setContents] = useState(initialContents);
  const formHandlerCallback = formHandlerCallbackHOF(contents);
  const textareaRef = useRef<HTMLTextAreaElement>();

  useLayoutEffect(() => {
    const textarea = textareaRef.current;
    const onInput = function () {
      this.style.height = 'auto';
      this.style.height = `${this.scrollHeight}px`;
    };

    textarea.addEventListener('input', onInput);

    return () => {
      textarea.removeEventListener('input', onInput);
    };
  }, []);

  return (
    <form
      aria-disabled={disabled}
      onSubmit={async (e) => {
        e.preventDefault();

        await formHandlerCallback();

        setContents('');

        if (closeCallback) {
          closeCallback();
        }
      }}
    >
      <div>
        <label htmlFor="commentTextarea" className="sr-only">
          댓글 입력
        </label>
        <textarea
          ref={textareaRef}
          id="commentTextarea"
          className="block resize-none w-full h-auto p-2 overflow-y-hidden border border-gray-500 rounded-md"
          value={contents}
          onChange={(e) => setContents(e.target.value)}
          placeholder={placeholder}
          disabled={disabled}
        />
      </div>

      <div className="text-right mt-2">
        <button
          className="inline-block bg-red-600 hover:bg-white px-4 py-2 text-white hover:text-red-600 text-lg font-medium rounded-md shadow-md mr-2"
          type="button"
          onClick={() => {
            setContents('');
            if (closeCallback) {
              closeCallback();
            }
          }}
        >
          취소
        </button>
        <button
          className="inline-block bg-green-600 hover:bg-white px-4 py-2 text-white hover:text-green-600 text-lg font-medium rounded-md shadow-md"
          type="submit"
          disabled={disabled}
        >
          확인
        </button>
      </div>
    </form>
  );
}

export default CommentForm;
