사용 방법
*JS_chat(add room)은 방이 3개이인 채팅방 코드 (1. npm install, 2. npm start, 3.서버 접속 시 url에 쿼리 파라미터 필수 추가)

    @@ 사용시 유의사항

    접속 url = http://localhost:5000?room=A

    name의 홍길동 ==> 각 사용자 명으로 변경 가능

    roomnum의 A ==> 채팅방은 총 A, B, C 로 총 3개 존재하며 대문자 A B C 이외는 오류발생
    
    
    @@ 수정완료 사항
    
    1)접속 url 쿼리 스트링 형식 수정 완료
    ex)
    http://localhost:5000?room=sd // 소프트웨어 설계 채팅방
    http://localhost:5000?room=sw // 소프트웨어 개발 채팅방
    http://localhost:5000?room=db // 데이터베이스 활용 채팅방
    http://localhost:5000?room=im // 정보시스템 구축관리 채팅방
    
    2) 채팅 UI width 600px, margin 50px 유지되도록 수정 완료
    
    3) 본 채팅 서비스 대표 컬러 노란색 (#fff176) 기준으로 수정 완료
    
    4) 채팅시 사용자명 img 아래에 위치하도록 수정완료
    
    
    ![채팅 캡처](https://user-images.githubusercontent.com/81874493/140017781-7d0f1257-13fd-4b82-bb46-6b0ec3bd24ad.JPG)


    @@ 향후 개선 사항
    1) 채팅에 사용할 이름 중복되지 않도록 처리하기
