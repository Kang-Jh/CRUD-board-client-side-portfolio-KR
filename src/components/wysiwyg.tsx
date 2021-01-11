import {
  useLayoutEffect,
  Fragment,
  Dispatch,
  SetStateAction,
  useRef,
} from 'react';
import Quill from 'quill';
import { constants } from '../utils';
import { Image } from '../types/Data';

const MEGA_BYTE = constants.MEGA_BYTE;

/**
 *
 * @param initialContents - initial contents
 * @param editorRef - callback ref
 */
const Editor = ({
  initialContents,
  editorRef,
  images,
  setImages,
  accessToken,
  csrfToken,
}: {
  initialContents: string;
  editorRef: (node: Element) => void;
  images: Image[];
  setImages: Dispatch<SetStateAction<Image[]>>;
  accessToken: string;
  csrfToken: string;
}) => {
  // 이미지 레퍼런스를 쓰는 이유는 이미지(images)를 그대로 쓸 경우
  // 이펙트가 사진이 삽입될 때마다 실행되기 때문임
  const imagesRef = useRef<Image[]>(images);
  const quillRef = useRef<Quill>();

  // 퀼 에디터를 실행시키는 이펙트
  // 커스텀 이미지 업로더가 추가되어 있음
  // 액세스 토큰이 변할 경우를 대비하여 조건문 추가
  useLayoutEffect(() => {
    async function changeHandler() {
      const image = (this as HTMLInputElement).files[0];

      if (!image.type.startsWith('image')) {
        alert('이미지 파일이 아닙니다');
        return;
      }

      if (image.size > 3 * MEGA_BYTE) {
        alert('파일 크기가 3MB를 초과할 수 없습니다');
        return;
      }

      // 유저가 선택한 이미지가 이미 업로드 되어 있는지 체크하는 조건문
      for (const i of imagesRef.current) {
        if (
          i.filename === image.name &&
          i.size === image.size &&
          i.mimetype === image.type
        ) {
          // 유저가 선택한 이미지가 이미 존재하면 그 이미지를 에디터에 삽입함
          let selection = quill.getSelection();
          if (selection) {
            quill.insertEmbed(selection.index, 'image', i.src);
            quill.setSelection(selection.index + 1, 0);
          } else {
            quill.setSelection(0, 0);
            selection = quill.getSelection();
            quill.insertEmbed(selection.index, 'image', i.src);
            quill.setSelection(selection.index + 1, 0);
          }
          return;
        }
      }

      // 아래의 코드들은 유저가 선택한 이미지를 업로드 하기 위한 코드
      const formData = new FormData();

      formData.set('image', image);
      formData.set('_csrf', csrfToken);

      const response = await fetch(
        'https://api.simplecrudboard.click/browser/image',
        {
          method: 'POST',
          mode: 'cors',
          credentials: 'include',
          headers: {
            Accept: 'application/json',
            Authorization: `Bearer ${accessToken}`,
          },
          body: formData,
        }
      );

      if (!response.ok) {
        alert('이미지 업로드에 실패했습니다');
        return;
      }

      const imageFromServer: Image = await response.json();

      // 이미지 업로드가 성공하면 이미지를 에디터에 삽입함
      let selection = quill.getSelection();
      if (selection) {
        quill.insertEmbed(selection.index, 'image', imageFromServer.src);
        quill.setSelection(selection.index + 1, 0);
      } else {
        quill.setSelection(0, 0);
        selection = quill.getSelection();
        quill.insertEmbed(selection.index, 'image', imageFromServer.src);
        quill.setSelection(selection.index + 1, 0);
      }

      // 이미지 레퍼런스와 이미지 상태를 업데이트
      imagesRef.current = [...imagesRef.current, imageFromServer];
      setImages((state) => {
        const newState = [...state, imageFromServer];

        return newState;
      });
    }

    // 커스텀 입력 버튼을 새로 만듬
    const imageButton = document.createElement('input');
    imageButton.setAttribute('type', 'file');
    imageButton.setAttribute('accept', 'image/*');
    imageButton.addEventListener('change', changeHandler);

    let quill = quillRef.current;
    if (!quill) {
      quill = new Quill('#editor', {
        modules: {
          toolbar: {
            container: [
              // TODO 글자 크기를 픽셀 단위로 설정할 수 있게 하기
              [{ size: ['small', false, 'large', 'huge'] }], // custom dropdown
              // TODO header 설정을 좀 더 직관적으로 표현하기
              // 예를 들면 소제목1, 소제목2, 소제목3, 소제목4, 본문(내용) 이런 식으로
              [{ header: [3, 4, 5, 6, false] }],
              ['bold', 'italic', 'underline', 'strike'], // toggled buttons
              [{ color: [] }, { background: [] }], // dropdown with defaults from theme
              [{ font: [] }],
              [{ align: [] }],
              [{ list: 'ordered' }, { list: 'bullet' }],
              // TODO 이미지 업로드시 base64 인코딩이 아닌 다른 방식의 적용 생각해보기
              // TODO s3 업로드 구현 전까지 이미지 삽입 불가
              ['link', 'image'],
              // ['blockquote', 'code-block'],
              // [{ script: 'sub' }, { script: 'super' }], // superscript/subscript
              // [{ indent: '-1' }, { indent: '+1' }], // outdent/indent
              // [{ direction: 'rtl' }], // text direction
            ],
            handlers: {
              image: function () {
                imageButton.click();
              },
            },
          },
        },
        theme: 'snow',
      });

      quillRef.current = quill;
    } else {
      quill = quillRef.current;
      const toolbar = quill.getModule('toolbar');
      toolbar.addHandler('image', () => {
        imageButton.click();
      });
    }

    return () => {
      imageButton.removeEventListener('change', changeHandler);
      imageButton.remove();
    };
  }, [accessToken, csrfToken, setImages]);

  return (
    <Fragment>
      <div
        className="h-5/6"
        ref={editorRef}
        id="editor"
        dangerouslySetInnerHTML={{ __html: initialContents }}
      />
    </Fragment>
  );
};

export default Editor;
