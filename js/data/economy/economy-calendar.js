const ECONOMY_CALENDAR = {
  1: {
    monthLabel: "1월",
    phaseLabel: "침체 초입",
    phaseShortLabel: "침체",
    phaseTone: "down",
    priceIndex: 1.02,
    stockBias: -0.22,
    cryptoBias: -0.30,
    safeAssetBias: 0.24,
    stockVolatility: 1.08,
    wageMultiplier: 0.97,
    exchangeIndex: 104,
    fearGreed: 28,
    newsPackId: "turn-01",
    newsPack: {
      macro: {
        title: "버핏 현금 더 쌓았다... 시장엔 '아직 때가 아니다' 방어론",
        body: "현금 보유와 방어적 포지션이 다시 주목받으며 공격적 베팅보다 생존이 먼저라는 심리가 퍼진다.",
      },
      stocks: {
        title: "기술주 눈높이 낮아지나... 실적 경고와 공매도 경계에 매수세 위축",
        body: "반도체와 성장주에 붙던 프리미엄이 꺾이며 지수 반등도 오래 버티지 못하는 흐름이다.",
      },
      crypto: {
        title: "비트코인 횡보 장기화... '이번 사이클 끝났다' 회의론 확산",
        body: "레버리지 포지션이 먼저 정리되고 알트코인 거래대금도 빠르게 식는다.",
      },
      safe: {
        title: "달러·금 동반 강세... '현금이 왕'이라는 말 다시 커져",
        body: "방어 자산과 예금으로 자금이 몰리며 위험회피 심리가 가격에 선명하게 찍힌다.",
      },
      local: {
        title: "배금시 자영업 체감 한파... 식비와 교통비 부담부터 커졌다",
        body: "지갑을 닫는 분위기가 번지며 구직자와 소상공인 모두 먼저 체감 경기를 말한다.",
      },
      preview: {
        title: "다음 달도 관망이 우세하다",
        body: "공격적인 추격보다 현금 관리와 손실 회피가 더 많이 언급된다.",
      },
    },
  },
  2: {
    monthLabel: "2월",
    phaseLabel: "침체 지속",
    phaseShortLabel: "침체",
    phaseTone: "down",
    priceIndex: 1.04,
    stockBias: -0.24,
    cryptoBias: -0.18,
    safeAssetBias: 0.26,
    stockVolatility: 1.12,
    wageMultiplier: 0.96,
    exchangeIndex: 106,
    fearGreed: 32,
    newsPackId: "turn-02",
    newsPack: {
      macro: {
        title: "서학개미 예금으로 이동... '지금은 수익보다 생존' 체념 번져",
        body: "악재에도 무덤덤한 분위기 속에 자금은 위험자산보다 현금성 자산으로 천천히 피신한다.",
      },
      stocks: {
        title: "거래대금 2년래 바닥권... 개별주 손절 뒤 관망세 짙어져",
        body: "지수보다 종목 체감이 더 차갑고, 작은 반등도 바로 매물에 눌리는 장세다.",
      },
      crypto: {
        title: "알트코인 거래량 급감... '죽은 시장' 평가까지 등장",
        body: "비트코인은 버텨도 주변 코인부터 무너지는 전형적인 침체 후반 흐름이 이어진다.",
      },
      safe: {
        title: "달러 예금·단기채 선호 확대... 방어 자산으로 피신 가속",
        body: "리스크를 줄이려는 돈이 늘며 안전자산 가격과 환율 민감도가 함께 높아진다.",
      },
      local: {
        title: "배금시 소비도 체념 모드... 늦은 밤 상권부터 조용해졌다",
        body: "작은 지출까지 다시 계산하는 분위기가 퍼지며 동네 체감 경기가 더 차갑게 식는다.",
      },
      preview: {
        title: "다음 달엔 저가매수 이야기가 고개를 들 수 있다",
        body: "아직 신뢰는 없지만 바닥을 따져보려는 시선은 조금씩 늘어난다.",
      },
    },
  },
  3: {
    monthLabel: "3월",
    phaseLabel: "회복 기대",
    phaseShortLabel: "회복",
    phaseTone: "neutral",
    priceIndex: 1.01,
    stockBias: -0.04,
    cryptoBias: 0.12,
    safeAssetBias: 0.08,
    stockVolatility: 1.09,
    wageMultiplier: 0.99,
    exchangeIndex: 103,
    fearGreed: 45,
    newsPackId: "turn-03",
    newsPack: {
      macro: {
        title: "급락 뒤 숨 고르기... 월가도 '싸졌지만 아직 확신은 없다'",
        body: "침체 공포는 다소 누그러졌지만 누구도 추세 전환을 쉽게 말하지 못하는 구간이다.",
      },
      stocks: {
        title: "반등 나왔지만 못 믿겠다... '데드캣 바운스' 경계 속 저가매수 유입",
        body: "기관 일부 매수가 포착되지만 개인 투자자는 여전히 손을 무겁게 올린다.",
      },
      crypto: {
        title: "비트코인 저가매수 유입... 그러나 추세 전환 판단은 아직 이르다",
        body: "코인은 주식보다 먼저 반응하지만 거래량이 확신을 줄 만큼 폭발적이진 않다.",
      },
      safe: {
        title: "금 강세는 둔화... 달러도 숨 고르며 방어 자금 이동 속도 완만",
        body: "안전자산이 밀리진 않지만 일부 자금이 다시 위험자산 테스트에 나선다.",
      },
      local: {
        title: "배금시도 조금은 숨 돌렸다... 할인 행사와 야간 유동 다시 소폭 증가",
        body: "분위기는 아직 조심스럽지만 소비가 완전히 멈춘 건 아니라는 신호가 보인다.",
      },
      preview: {
        title: "다음 달엔 '최악은 지났다'는 말이 더 자주 들릴 수 있다",
        body: "반등이 이어지면 바닥론과 목표가 상향이 함께 등장할 수 있다.",
      },
    },
  },
  4: {
    monthLabel: "4월",
    phaseLabel: "회복기",
    phaseShortLabel: "회복",
    phaseTone: "up",
    priceIndex: 0.99,
    stockBias: 0.14,
    cryptoBias: 0.24,
    safeAssetBias: -0.06,
    stockVolatility: 1.02,
    wageMultiplier: 1.01,
    exchangeIndex: 100,
    fearGreed: 58,
    newsPackId: "turn-04",
    newsPack: {
      macro: {
        title: "'최악은 지났다' 바닥론 부상... 시장 안도 랠리 확산",
        body: "금리 부담 완화 기대와 저가매수세가 겹치며 냉각됐던 심리가 눈에 띄게 풀린다.",
      },
      stocks: {
        title: "반도체·AI주 동반 반등... 월가 목표가 상향 조정 시작",
        body: "성장주가 지수보다 먼저 치고 나가며 회복 초입의 주도 업종 구도가 만들어진다.",
      },
      crypto: {
        title: "비트코인 핵심 저항선 돌파 시도... 조심스러운 낙관론 고개",
        body: "코인은 여전히 한발 앞서 움직이며 회복 기대를 가격에 먼저 반영한다.",
      },
      safe: {
        title: "달러·금 차익실현 물량... 방어 자산에 몰렸던 긴장 완화",
        body: "위험자산 선호가 되살아나며 안전자산은 당장 급하지 않다는 인식이 강해진다.",
      },
      local: {
        title: "배금시 상권도 되살아났다... 퇴근 뒤 유동과 소액 소비 회복",
        body: "카페와 편의점 매출이 먼저 움직이며 체감 경기 저점 통과론이 지역에서도 돈다.",
      },
      preview: {
        title: "다음 달엔 낙관론이 더 빨리 퍼질 수 있다",
        body: "주식 회복에 코인 강세가 겹치면 위험선호가 생각보다 빠르게 커진다.",
      },
    },
  },
  5: {
    monthLabel: "5월",
    phaseLabel: "회복 후반",
    phaseShortLabel: "강세",
    phaseTone: "up",
    priceIndex: 1.01,
    stockBias: 0.18,
    cryptoBias: 0.30,
    safeAssetBias: -0.12,
    stockVolatility: 1.06,
    wageMultiplier: 1.03,
    exchangeIndex: 98,
    fearGreed: 68,
    newsPackId: "turn-05",
    newsPack: {
      macro: {
        title: "낙관론 재점화... '조정 때마다 사라'는 목소리 다시 커졌다",
        body: "유동성 기대와 경기 회복 신호가 겹치며 위험자산 선호가 본격적으로 확대된다.",
      },
      stocks: {
        title: "AI 랠리 재점화... 나스닥형 성장주에 자금 다시 몰려",
        body: "실적보다 기대가 앞서기 시작하며 대형 기술주가 시장 낙관론을 다시 주도한다.",
      },
      crypto: {
        title: "비트코인 현물 ETF 자금 순유입 확대... 기관 수요 복귀 기대",
        body: "알트코인보다 비트코인이 먼저 힘을 받으며 코인시장 전체 심리도 함께 살아난다.",
      },
      safe: {
        title: "달러 방어론 약해졌다... 금도 쉬어가며 안전자산 매력 감소",
        body: "공포가 빠르게 잦아들며 방어 자산은 수익 실현 구간으로 인식된다.",
      },
      local: {
        title: "배금시 신규 창업 문의 증가... '이제 좀 돈이 돈다'는 말 확산",
        body: "지갑을 닫던 분위기가 풀리며 야간 소비와 이동량이 함께 늘어난다.",
      },
      preview: {
        title: "다음 달부터는 안 산 사람이 초조해질 수 있다",
        body: "주가와 코인이 같이 달리면 추격매수와 빚투가 다시 붙기 쉽다.",
      },
    },
  },
  6: {
    monthLabel: "6월",
    phaseLabel: "호황기",
    phaseShortLabel: "호황",
    phaseTone: "hot",
    priceIndex: 1.03,
    stockBias: 0.26,
    cryptoBias: 0.40,
    safeAssetBias: -0.18,
    stockVolatility: 1.12,
    wageMultiplier: 1.05,
    exchangeIndex: 96,
    fearGreed: 79,
    newsPackId: "turn-06",
    newsPack: {
      macro: {
        title: "위험선호 복원... '지금 안 타면 늦는다'는 말이 시장을 덮는다",
        body: "수익 기회가 눈앞에 있다는 심리가 퍼지며 보수적 자금까지 공격적으로 이동한다.",
      },
      stocks: {
        title: "서학개미 복귀... AI주 추격매수와 신용융자 잔액 동반 증가",
        body: "오를 때 더 사는 흐름이 굳어지며 강세장이 편안한 장세처럼 포장된다.",
      },
      crypto: {
        title: "비트코인 신고가 기대 확산... 알트코인 순환매 본격화",
        body: "코인은 주식보다 더 가파르게 달리며 FOMO 심리의 중심으로 올라선다.",
      },
      safe: {
        title: "안전자산 소외 심화... 현금 보유가 오히려 답답하다는 말까지",
        body: "금과 달러에 머물던 자금이 수익률을 좇아 위험자산 쪽으로 빠르게 이동한다.",
      },
      local: {
        title: "배금시 소비도 과감해졌다... 외식·쇼핑·모임 수요 한꺼번에 반등",
        body: "동네 분위기가 살아나며 '돈 쓸 사람은 다 쓴다'는 체감이 커진다.",
      },
      preview: {
        title: "다음 달엔 탐욕과 과열 경고가 함께 나타날 수 있다",
        body: "상승이 너무 쉬워 보이는 시기일수록 피로 누적도 빨라진다.",
      },
    },
  },
  7: {
    monthLabel: "7월",
    phaseLabel: "과열기",
    phaseShortLabel: "과열",
    phaseTone: "hot",
    priceIndex: 1.05,
    stockBias: 0.12,
    cryptoBias: 0.28,
    safeAssetBias: -0.08,
    stockVolatility: 1.18,
    wageMultiplier: 1.04,
    exchangeIndex: 97,
    fearGreed: 86,
    newsPackId: "turn-07",
    newsPack: {
      macro: {
        title: "'이번엔 다르다' 낙관론 확산... 과열 경고에도 매수세는 더 세졌다",
        body: "이익보다 기대가 크게 불어나며 강세장이 자기 정당화를 시작하는 구간이다.",
      },
      stocks: {
        title: "빚투 사상 최대 근접... 적자 기업까지 급등하며 밸류에이션 무뎌져",
        body: "실적보다 이야기와 기대감이 시장을 움직이며 위험한 상승이 편안해 보이기 시작한다.",
      },
      crypto: {
        title: "직장인·대학생까지 코인시장 재진입... '이번 사이클은 다르다' 확산",
        body: "레버리지와 밈코인 관심이 동시에 커지며 코인시장은 주식보다 더 뜨거워진다.",
      },
      safe: {
        title: "금·달러는 외면받는다... 방어 자산은 '기회비용' 취급",
        body: "안전자산에 머문 돈이 비효율처럼 보이기 시작하며 시장의 균형이 깨진다.",
      },
      local: {
        title: "배금시도 들뜬 분위기... 고가 소비와 무리한 투자 인증이 늘었다",
        body: "체감 호황이 커질수록 과소비와 과신도 함께 늘어나는 전형적 구간이다.",
      },
      preview: {
        title: "다음 달엔 광풍이 정점으로 치달을 수 있다",
        body: "밈 자산이 주도권을 잡기 시작하면 과열은 생각보다 빨리 극단으로 간다.",
      },
    },
  },
  8: {
    monthLabel: "8월",
    phaseLabel: "후퇴 초입",
    phaseShortLabel: "후퇴",
    phaseTone: "down",
    priceIndex: 1.06,
    stockBias: -0.08,
    cryptoBias: -0.18,
    safeAssetBias: 0.10,
    stockVolatility: 1.16,
    wageMultiplier: 1.02,
    exchangeIndex: 100,
    fearGreed: 67,
    newsPackId: "turn-08",
    newsPack: {
      macro: {
        title: "광풍이 시장을 덮었다... '전례 없는 상승'이라는 말까지 등장",
        body: "너무 많은 사람이 너무 쉽게 돈을 번다고 믿는 순간, 시장은 가장 위험한 정점에 가까워진다.",
      },
      stocks: {
        title: "밈주식·테마주 광풍... '버핏은 구시대' 조롱까지 나온다",
        body: "실적과 무관한 종목이 치솟고 커뮤니티 열기가 가격을 끌어올리는 과열의 끝물이다.",
      },
      crypto: {
        title: "밈코인 하루 수백% 급등... 풀대출 투자 인증까지 번진다",
        body: "코인은 이미 광기의 영역에 들어섰고, 작은 악재도 연쇄 급락의 도화선이 될 수 있다.",
      },
      safe: {
        title: "달러·금 저평가론 등장... 하지만 아직은 아무도 귀 기울이지 않는다",
        body: "방어 자산은 조용히 바닥을 다지지만 군중의 시선은 여전히 위험자산에 고정된다.",
      },
      local: {
        title: "배금시도 소비 광풍... 웃돈 거래와 단기 차익 자랑이 일상화",
        body: "돈이 쉽다는 착시가 퍼지며 지역 커뮤니티도 투자 이야기로 과열된다.",
      },
      preview: {
        title: "다음 달부터는 균열과 경고가 눈에 띄게 늘 수 있다",
        body: "내부자 매도와 규제 뉴스가 붙기 시작하면 분위기는 순식간에 바뀐다.",
      },
    },
  },
  9: {
    monthLabel: "9월",
    phaseLabel: "후퇴기",
    phaseShortLabel: "후퇴",
    phaseTone: "down",
    priceIndex: 1.05,
    stockBias: -0.18,
    cryptoBias: -0.24,
    safeAssetBias: 0.18,
    stockVolatility: 1.10,
    wageMultiplier: 1.00,
    exchangeIndex: 103,
    fearGreed: 51,
    newsPackId: "turn-09",
    newsPack: {
      macro: {
        title: "거품 경고 재점화... 숫자보다 열기가 먼저였다는 지적 커져",
        body: "낙관은 남아 있지만 과열의 균열이 보이기 시작하며 시장의 시선이 예민해진다.",
      },
      stocks: {
        title: "내부자 매도 확대 조짐... 버리식 역베팅 경계가 다시 고개",
        body: "지수는 버텨도 고평가 종목부터 흔들리며 강세장 피로가 뚜렷해진다.",
      },
      crypto: {
        title: "비트코인 신고가 뒤 변동성 확대... 고래 매도 포착에 경계심",
        body: "코인은 먼저 꺾인 뒤 짧은 반등을 반복하며 투자자 신경을 곤두세운다.",
      },
      safe: {
        title: "금·달러 반등 조짐... 위험회피 자금이 천천히 복귀",
        body: "군중이 뒤늦게 방어를 찾기 시작하면서 안전자산은 다시 존재감을 드러낸다.",
      },
      local: {
        title: "배금시도 기대보다 불안이 커졌다... 소비는 남았지만 표정은 굳어",
        body: "겉으론 활기가 남아도 큰돈 쓰는 사람일수록 한 발 물러서는 모습이 보인다.",
      },
      preview: {
        title: "다음 달엔 급락 쇼크가 현실이 될 수 있다",
        body: "레버리지와 고평가가 함께 쌓인 장은 작은 충격에도 크게 무너진다.",
      },
    },
  },
  10: {
    monthLabel: "10월",
    phaseLabel: "공포기",
    phaseShortLabel: "공포",
    phaseTone: "down",
    priceIndex: 1.04,
    stockBias: -0.30,
    cryptoBias: -0.42,
    safeAssetBias: 0.28,
    stockVolatility: 1.22,
    wageMultiplier: 0.96,
    exchangeIndex: 108,
    fearGreed: 24,
    newsPackId: "turn-10",
    newsPack: {
      macro: {
        title: "급락 쇼크... 탐욕지수 급반전하며 리스크 오프 전면화",
        body: "조정이라던 말이 무색해질 만큼 매도 압력이 커지며 시장 전체가 공포 구간으로 밀려난다.",
      },
      stocks: {
        title: "AI 대장주 시총 급증발... 반대매매 우려까지 번졌다",
        body: "버티던 대형주가 무너지자 개별주 체감 하락은 더 가파르게 악화된다.",
      },
      crypto: {
        title: "비트코인 급락·청산 폭증... 레버리지 포지션 연쇄 붕괴",
        body: "고배율 포지션과 밈자산이 먼저 쓸려나가며 코인시장은 공포를 가장 크게 반영한다.",
      },
      safe: {
        title: "달러·금 급등... '현금만이 방어'라는 말이 다시 시장 덮쳐",
        body: "방어 자산이 거의 유일한 피난처처럼 보이며 안전선호가 가격에 직선적으로 반영된다.",
      },
      local: {
        title: "배금시도 지갑 닫았다... 늦은 밤 상권과 소비심리 급속 냉각",
        body: "투자 손실이 실물 소비 위축으로 번지며 체감 경기 악화가 바로 드러난다.",
      },
      preview: {
        title: "다음 달엔 패닉셀과 손절 기사가 쏟아질 수 있다",
        body: "공포가 극단으로 커질수록 저점 탐색보다 현금 확보가 먼저가 된다.",
      },
    },
  },
  11: {
    monthLabel: "11월",
    phaseLabel: "바닥 다지기",
    phaseShortLabel: "바닥",
    phaseTone: "neutral",
    priceIndex: 1.02,
    stockBias: -0.06,
    cryptoBias: 0.10,
    safeAssetBias: 0.08,
    stockVolatility: 1.08,
    wageMultiplier: 0.99,
    exchangeIndex: 104,
    fearGreed: 39,
    newsPackId: "turn-11",
    newsPack: {
      macro: {
        title: "패닉셀 현실화... '현금이 유일한 방어'라는 말 다시 힘 얻어",
        body: "극단적 공포 속에 손절과 청산이 이어지며 생존 중심의 심리가 시장을 지배한다.",
      },
      stocks: {
        title: "서학개미 손절 확산... 빚투 계좌 반대매매 우려 현실화",
        body: "좋을 때는 안 보이던 리스크가 한꺼번에 가격에 반영되며 장이 무겁게 주저앉는다.",
      },
      crypto: {
        title: "알트코인 연쇄 붕괴·해킹 우려까지... 코인시장 신뢰 흔들",
        body: "코인은 작은 악재에도 과도하게 반응하며 패닉의 증폭기 역할을 한다.",
      },
      safe: {
        title: "달러·금 강세 지속... 방어 자산만 조용히 신고가 근처",
        body: "누군가는 이미 다음 기회를 보지만 대다수는 아직 손실 회복보다 현금 보전을 택한다.",
      },
      local: {
        title: "배금시 분위기도 얼어붙었다... '다시는 투자 안 한다'는 말 확산",
        body: "지갑을 닫고 리스크를 줄이려는 심리가 지역 상권과 커뮤니티 전반에 번진다.",
      },
      preview: {
        title: "다음 달엔 침묵 속 바닥 다지기 가능성이 열린다",
        body: "투매가 진정되면 거래는 줄어도 반대편에서 조용한 매집이 시작될 수 있다.",
      },
    },
  },
  12: {
    monthLabel: "12월",
    phaseLabel: "재반등",
    phaseShortLabel: "반등",
    phaseTone: "up",
    priceIndex: 1.01,
    stockBias: 0.14,
    cryptoBias: 0.22,
    safeAssetBias: -0.04,
    stockVolatility: 1.04,
    wageMultiplier: 1.02,
    exchangeIndex: 100,
    fearGreed: 55,
    newsPackId: "turn-12",
    newsPack: {
      macro: {
        title: "광풍 뒤 침묵... 버핏식 현금 전략이 다시 재평가된다",
        body: "열기가 빠져나간 자리에서 시장은 다음 사이클을 준비하며 천천히 균형을 되찾는다.",
      },
      stocks: {
        title: "연말 반등 시도 속 옥석 가리기... 무조건 강세보다 선별 매수",
        body: "모든 종목이 함께 오르진 않지만 살아남은 종목에는 다시 관심이 붙기 시작한다.",
      },
      crypto: {
        title: "거래량은 말랐지만 바닥론 고개... 코인시장도 조용한 재정비",
        body: "과열이 씻겨나간 뒤에야 비트코인과 대형 코인이 다시 기준점 역할을 찾는다.",
      },
      safe: {
        title: "달러·금 강세는 잦아들고 균형 복귀... 방어 자산도 숨 고르기",
        body: "시장이 완전히 낙관으로 돌아선 건 아니지만 공포의 절정은 지나갔다는 시선이 늘어난다.",
      },
      local: {
        title: "배금시도 한숨 돌렸다... 소비는 조심스럽지만 사람들은 다시 움직인다",
        body: "과열 뒤 후회가 남았지만 다음 기회를 엿보는 사람들도 조금씩 돌아온다.",
      },
      preview: {
        title: "다음 사이클은 다시 작은 기대에서 시작된다",
        body: "침묵이 길어질수록 저가매수와 재평가 이야기는 다시 고개를 들 수 있다.",
      },
    },
  },
};
