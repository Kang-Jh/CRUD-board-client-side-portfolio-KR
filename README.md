# CRUD Board Portfolio - Client-side

[CRUD Board](https://www.simplecrudboard.click)

이 프로젝트는 포트폴리오용 게시판 프로젝트의 클라이언트 사이드를 구현한 프로젝트입니다.
[서버 사이드 프로젝트](https://github.com/Kang-Jh/CRUD-board-server-side-portfolio-KR)와 연동되어 있습니다.

Next.js를 이용하였고, Tailwind CSS를 이용해 UI를 구현했습니다.

홈페이지는 무한 스크롤을 이용할 수 있게 구현했습니다.

글쓰기 페이지에는 Quill 에디터를 이용하여 WYSIWYG 에디터를 구현하였고, 서버 사이드 프로젝트와 연동되어 컨텐츠에 이미지 삽입 시 자동으로 S3에 업로드 되게 하였습니다.

또한 드래그&드롭을 이용하여 이미지 파일을 업로드하는 것도 구현하였습니다.

로그인 시스템은 가짜 로그인 시스템과 소셜 로그인 시스템으로 구성되어 있으며
소셜 로그인 시스템은 사이트에는 구현되어 있지만 코드 상에는 구글 클라이언트 아이디와 페이스북 앱 아이디를 제거하였습니다.

소셜 로그인 시스템의 작동을 확인하기 위해 개발 환경에서는 OpenSSL과 devcert을 이용하여 https를 적용하여 작동을 확인했습니다.

글 페이지에는 무한 스크롤을 이용한 댓글 시스템이 구현되어 있으며, 글 또는 댓글을 삭제 시도시 모달 창을 띄우는 방식을 구현하였습니다.

## 기술 스택

- ReactJS (Hooks Based)
- NextJS
- TailwindCSS
- Typescript
