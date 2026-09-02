import type { BookSearchResult } from "./types";

export const mockBooks: BookSearchResult[] = [
  {
    id: "mock-cosmos",
    title: "코스모스",
    author: "칼 세이건",
    publisher: "사이언스북스",
    publishedYear: 2006,
    description: "우주의 탄생과 생명의 진화를 넓은 시야로 풀어낸 과학 교양서입니다. 천문학을 처음 접하는 독자도 이야기처럼 따라갈 수 있어요.",
    subjects: ["과학", "우주"],
    keywords: ["우주", "천문", "과학", "초등학생", "쉽게", "교양"],
    holdings: [
      { libraryId: "sangdong", libraryName: "상동도서관", callNumber: "443.1-세68ㅋ", available: true },
      { libraryId: "wonmi", libraryName: "원미도서관", callNumber: "443.1-세68ㅋ", available: false },
    ],
  },
  {
    id: "mock-almond",
    title: "아몬드",
    author: "손원평",
    publisher: "다즐링",
    publishedYear: 2023,
    description: "감정을 잘 느끼지 못하는 소년이 타인과 관계를 맺으며 성장하는 이야기입니다. 짧고 선명한 문장으로 공감과 이해를 전해요.",
    subjects: ["한국소설", "성장"],
    keywords: ["소설", "따뜻", "마음", "성장", "공감", "짧은"],
    holdings: [
      { libraryId: "sangdong", libraryName: "상동도서관", callNumber: "813.7-손66ㅇ", available: false },
      { libraryId: "kkumyeoul", libraryName: "꿈여울도서관", callNumber: "813.7-손66ㅇ", available: true },
    ],
  },
  {
    id: "mock-convenience-store",
    title: "불편한 편의점",
    author: "김호연",
    publisher: "나무옆의자",
    publishedYear: 2021,
    description: "서울의 작은 편의점을 오가는 이웃들의 사연을 따뜻하게 엮은 소설입니다. 편안하게 읽으며 사람 사이의 온기를 느낄 수 있어요.",
    subjects: ["한국소설", "이웃"],
    keywords: ["소설", "따뜻", "마음", "힐링", "이웃", "편안"],
    holdings: [
      { libraryId: "songnae", libraryName: "송내도서관", callNumber: "813.7-김95ㅂ", available: true },
      { libraryId: "bookbup", libraryName: "북부도서관", callNumber: "813.7-김95ㅂ", available: true },
    ],
  },
  {
    id: "mock-psychology-money",
    title: "돈의 심리학",
    author: "모건 하우절",
    publisher: "인플루엔셜",
    publishedYear: 2021,
    description: "투자 기술보다 돈을 대하는 태도와 판단 습관을 설명하는 재테크 입문서입니다. 경제 지식이 많지 않아도 읽기 쉬워요.",
    subjects: ["경제", "재테크"],
    keywords: ["돈", "재테크", "투자", "입문", "경제", "심리"],
    holdings: [
      { libraryId: "wonmi", libraryName: "원미도서관", callNumber: "327.04-하66ㄷ", available: true },
      { libraryId: "oajeong", libraryName: "오정도서관", callNumber: "327.04-하66ㄷ", available: false },
    ],
  },
];
