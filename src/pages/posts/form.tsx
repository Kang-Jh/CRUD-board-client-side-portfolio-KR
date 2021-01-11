import {
  Fragment,
  useState,
  useContext,
  useRef,
  useEffect,
  useCallback,
} from 'react';
import { useRouter } from 'next/router';
import dynamic from 'next/dynamic';
import Head from 'next/head';
import { GetServerSideProps } from 'next';
import nodeFetch from 'node-fetch';
import { constants } from '../../utils';
import { AccessTokenContext, CsrfContext, UserContext } from '../../contexts';
import { Post, Image } from '../../types/Data';

const MEGA_BYTE = constants.MEGA_BYTE;

const Editor = dynamic(() => import('../../components/wysiwyg'), {
  ssr: false,
});

export const getServerSideProps: GetServerSideProps = async (context) => {
  const postId = context.query.id;
  if (!postId) {
    const post: Partial<Post> = {
      title: '',
      author: {
        _id: '',
      },
      contents: '',
      _id: '',
      images: [],
    };

    return {
      props: {
        data: post,
      },
    };
  }

  const response = await nodeFetch(
    `https://api.simplecrudboard.click/browser/posts/${postId}`
  );

  if (response.status === 404) {
    return {
      notFound: true,
    };
  }

  const json: Post = await response.json();

  return {
    props: {
      data: json,
    },
  };
};

const PostForm = ({
  data: {
    title: initialPostTitle,
    contents: initialPostContents,
    _id: initialPostId,
    author: { _id: initialAuthorId },
    images: initialImages,
  },
}: {
  data: Post;
}) => {
  const router = useRouter();
  const csrfToken = useContext(CsrfContext);
  const { accessToken } = useContext(AccessTokenContext);
  const { user } = useContext(UserContext);

  const [title, setTitle] = useState(initialPostTitle);
  // editor's first element child's innerHTML is contents
  const [editor, setEditor] = useState<Element>();
  const editorRef = useCallback((node: Element) => {
    if (node !== null) {
      setEditor(node);
    }
  }, []);
  const thumbnailInputRef = useRef<HTMLInputElement>();
  const [images, setImages] = useState<Image[]>(initialImages);
  const [thumbnailFile, setThumbnailFile] = useState<File>();
  const [thumbnailPreviewImgSrc, setThumbnailPreviewImgSrc] = useState('');

  useEffect(() => {
    if (!accessToken) {
      router.back();
    }
  }, [accessToken, router]);

  useEffect(() => {
    if (initialAuthorId && initialAuthorId !== user._id) {
      router.back();
    }
  }, [initialAuthorId, router, user._id]);

  if (!accessToken) {
    return null;
  }

  if (initialAuthorId && initialAuthorId !== user._id) {
    return null;
  }

  return (
    <Fragment>
      <Head>
        <title>글쓰기</title>
      </Head>

      <h2 className="sr-only">글 쓰기</h2>
      <form
        className="h-screen"
        encType="multipart/form-data"
        onSubmit={async (e) => {
          e.preventDefault();
          const contents = editor.firstElementChild.innerHTML;

          if (!title) {
            alert('제목을 입력해주세요');
            return;
          }

          if (contents.replace(/<p><br><\/p>/g, '').length === 0) {
            alert('내용을 입력해주세요');
            return;
          }

          // Content-Type should NOT be set
          // if content-type is set to multipart/form-data
          // it should occur error(boundary not found error)
          const headers = new Headers();
          headers.set('Accept', 'application/json');
          headers.set('Authorization', `Bearer ${accessToken}`);

          const formData = new FormData();
          formData.set('title', title);
          formData.set('contents', contents);
          formData.set('images', JSON.stringify(images));
          formData.set('_csrf', csrfToken);
          if (thumbnailFile) {
            formData.set('thumbnail', thumbnailFile);
          }

          const response = await fetch(
            initialPostId
              ? `https://api.simplecrudboard.click/browser/posts/${initialPostId}`
              : 'https://api.simplecrudboard.click/browser/posts',
            {
              method: initialPostId ? 'PUT' : 'POST',
              headers,
              body: formData,
              credentials: 'include',
            }
          );

          if (!response.ok) {
            alert('글쓰기에 실패했습니다');
            return;
          }

          const { _id } = await response.json();
          router.push(`/posts/${_id}`);
        }}
      >
        {/* title input field */}
        <div className="mb-3">
          <label
            className="inline-block mr-4 text-lg font-medium text-gray-700"
            htmlFor="title"
          >
            제목
          </label>
          <input
            className="inline-block focus:ring-indigo-500 focus:border-indigo-500 w-3/4 pl-6 rounded-md border-gray-300 border"
            type="text"
            name="title"
            id="title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="제목을 입력해주세요"
          />
        </div>

        {/* thumbnail upload or drag & drop division */}
        <div className="mb-3">
          <label className="block text-lg font-medium text-gray-700">
            썸네일
          </label>
          <div
            className="mt-2 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-md"
            onDrop={(e) => {
              e.preventDefault();

              let thumbnail: File;
              if (
                e.dataTransfer.items &&
                e.dataTransfer.items[0].kind === 'file'
              ) {
                thumbnail = e.dataTransfer.items[0].getAsFile();
              } else {
                thumbnail = e.dataTransfer.files[0];
              }

              if (thumbnail) {
                if (!thumbnail.type.startsWith('image')) {
                  alert('썸네일이 이미지 파일이 아닙니다');
                  return;
                }

                if (thumbnail.size > 3 * MEGA_BYTE) {
                  alert('썸네일 용량이 1MB보다 큽니다');
                  return;
                }

                setThumbnailFile(thumbnail);

                const fileReader = new FileReader();
                fileReader.onerror = function () {
                  this.abort();
                };

                fileReader.onloadend = function () {
                  if (this.readyState === 2) {
                    // if fileReader successfully read thumbnail
                    // set thumbnail preview image source
                    setThumbnailPreviewImgSrc(this.result as string);
                  }
                };
                fileReader.readAsDataURL(thumbnail);
              }
            }}
            onDragOver={(e) => {
              e.preventDefault();
            }}
          >
            <div className="space-y-1 text-center">
              {thumbnailPreviewImgSrc ? (
                <img
                  className="mx-auto h-36 w-36 text-gray-400"
                  src={thumbnailPreviewImgSrc}
                  alt="썸네일 미리보기"
                />
              ) : (
                <svg
                  className="mx-auto h-36 w-36 text-gray-400"
                  stroke="currentColor"
                  fill="none"
                  viewBox="0 0 48 48"
                  aria-hidden="true"
                >
                  <path
                    d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              )}

              {thumbnailFile && (
                <div className="text-center text-xs text-gray-500 truncate">
                  {thumbnailFile.name}
                </div>
              )}

              <div className="flex text-sm text-gray-600 justify-center">
                {/* file upload field  */}
                <label
                  htmlFor="thumbnail"
                  className="relative cursor-pointer bg-white rounded-md font-medium text-indigo-600 hover:text-indigo-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-indigo-500"
                >
                  <span>파일을 업로드</span>
                  <input
                    className="sr-only"
                    type="file"
                    accept="image/*"
                    name="thumbnail"
                    id="thumbnail"
                    onChange={() => {
                      const thumbnail: File =
                        thumbnailInputRef.current.files[0];
                      if (thumbnail) {
                        if (!thumbnail.type.startsWith('image')) {
                          alert('썸네일이 이미지 파일이 아닙니다');
                          return;
                        }

                        if (thumbnail.size > 3 * MEGA_BYTE) {
                          alert('썸네일 용량이 1MB보다 큽니다');
                          return;
                        }

                        setThumbnailFile(thumbnail);

                        const fileReader = new FileReader();
                        fileReader.onerror = function () {
                          this.abort();
                        };

                        fileReader.onloadend = function () {
                          if (this.readyState === 2) {
                            // if fileReader successfully read thumbnail
                            // set thumbnail preview image source
                            setThumbnailPreviewImgSrc(this.result as string);
                          }
                        };
                        fileReader.readAsDataURL(thumbnail);
                      }
                    }}
                    ref={thumbnailInputRef}
                  />
                </label>
                <p className="pl-1">또는 드래그&드롭 해주시기 바랍니다</p>
              </div>
              <p className="text-xs text-gray-500">
                선택된 파일은 취소되지 않습니다
              </p>
              <p className="text-xs text-gray-500">
                최대 3MB 이미지 파일이 업로드 가능합니다
              </p>
            </div>
          </div>
        </div>

        {/* contents input field */}
        <Editor
          initialContents={initialPostContents}
          editorRef={editorRef}
          images={images}
          setImages={setImages}
          accessToken={accessToken}
          csrfToken={csrfToken}
        />

        <div className="text-right mb-8 mt-2">
          <button
            className="inline-block bg-red-600 hover:bg-white py-2 px-4 font-semibold text-white hover:text-red-600 text-lg rounded-lg shadow-md  mr-2"
            type="button"
            onClick={() => {
              router.back();
            }}
          >
            취소
          </button>
          <button
            className="inline-block bg-green-600 hover:bg-white py-2 px-4 font-semibold text-white hover:text-green-600 text-lg rounded-lg shadow-md"
            type="submit"
          >
            {initialPostId ? '수정' : '등록'}
          </button>
        </div>
      </form>
    </Fragment>
  );
};

export default PostForm;
