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
        title: "긴축 경계가 다시 고개를 들며 1월 자금이 움츠러든다",
        body: "소비와 투자 모두 조심스러운 흐름으로 바뀌며 현금 선호가 강해진다.",
      },
      stocks: {
        title: "실적 경고가 먼저 나오며 주식시장이 무겁게 밀린다",
        body: "대형주부터 눈높이가 낮아지며 반등 시도도 오래 버티지 못한다.",
      },
      crypto: {
        title: "코인은 이미 먼저 흔들리며 레버리지 포지션이 정리된다",
        body: "주식보다 한발 앞서 급락과 반등 실패가 반복되는 구간이다.",
      },
      safe: {
        title: "금과 환율이 위험회피 수요를 빨아들이며 강세를 보인다",
        body: "방어 자산으로 자금이 숨어들면서 현금과 달러 선호가 빠르게 올라온다.",
      },
      local: {
        title: "배금시 체감 경기도 한파, 생활비 압박이 먼저 온다",
        body: "식비와 이동비 부담이 올라 구직자 체감이 빠르게 나빠진다.",
      },
      preview: {
        title: "다음 달도 아직 침체권이다",
        body: "성급한 추격보다 방어와 현금 관리가 우선인 흐름이다.",
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
        title: "투자와 소비가 동시에 움츠러들며 신용 경색 우려가 커진다",
        body: "기업과 가계가 모두 조심스러워지며 시장 전체 체력이 약해진다.",
      },
      stocks: {
        title: "실적 실망이 이어지며 중소형주 낙폭이 더 커진다",
        body: "지수는 버티는 척하지만 개별 종목의 체감 하락은 더 깊다.",
      },
      crypto: {
        title: "코인은 바닥 탐색에 들어가지만 변동성은 오히려 더 커진다",
        body: "약세장이 길어지며 짧은 반등도 오래 이어지지 못한다.",
      },
      safe: {
        title: "달러와 금 선호가 더 강해지며 방어 자산이 주목받는다",
        body: "리스크를 피하려는 자금이 현금성 자산으로 몰리는 구간이다.",
      },
      local: {
        title: "생활비 상승 체감이 심해지며 배금시 소비가 더 얼어붙는다",
        body: "작은 지출도 조심하는 분위기가 동네 상권 전체에 번진다.",
      },
      preview: {
        title: "3월엔 회복 기대가 조금씩 붙기 시작한다",
        body: "아직 확신은 없지만 저가매수 이야기가 슬슬 고개를 든다.",
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
        title: "유동성 완화 기대가 돌며 시장이 바닥을 가늠하기 시작한다",
        body: "긴축이 끝날 수 있다는 기대만으로도 분위기가 조금 달라진다.",
      },
      stocks: {
        title: "주식은 아직 조심스럽지만 저가매수 유입이 눈에 띄기 시작한다",
        body: "본격 반등이라 부르긴 이르지만 매도 공포는 다소 잦아드는 중이다.",
      },
      crypto: {
        title: "코인은 선반영으로 먼저 반응하며 회복 기대를 가격에 담는다",
        body: "주식보다 한 박자 앞서 기대감이 붙고 거래량이 살아난다.",
      },
      safe: {
        title: "금과 환율은 강세가 둔화되며 숨 고르기 구간에 들어간다",
        body: "방어 자산에 몰렸던 자금이 일부 위험 자산으로 되돌아간다.",
      },
      local: {
        title: "배금시 생활 분위기도 조금 풀리며 소비가 천천히 돌아온다",
        body: "지갑은 여전히 얇지만 사람들의 표정이 전월보단 덜 굳어 있다.",
      },
      preview: {
        title: "4월엔 회복 신호가 더 또렷해질 가능성이 높다",
        body: "코인 선행 반등이 맞다면 주식도 뒤따를 여지가 있다.",
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
        title: "회복 신호가 늘어나며 시장이 안도 랠리를 이어간다",
        body: "소비와 투자 심리가 동시에 살아나며 흐름이 확실히 부드러워진다.",
      },
      stocks: {
        title: "성장주와 반도체가 먼저 반등하며 주식시장 회복이 확인된다",
        body: "지수보다 개별 업종 반응이 더 빠르게 나타나는 구간이다.",
      },
      crypto: {
        title: "코인은 기대를 키우며 강한 상승을 이어가고 있다",
        body: "선행 자산답게 회복 기대를 더 크게 가격에 담아낸다.",
      },
      safe: {
        title: "금과 환율은 차익 실현 구간에 들어가며 과열이 풀린다",
        body: "방어 자산에 쏠렸던 긴장이 조금씩 해소되는 흐름이다.",
      },
      local: {
        title: "배금시 상권도 회복 기류, 야간 유동 인구가 다시 늘어난다",
        body: "동네 분위기가 풀리며 소소한 소비와 이동도 다시 늘어난다.",
      },
      preview: {
        title: "5월엔 회복 후반 강세가 붙을 가능성이 높다",
        body: "위험 자산 선호가 계속되면 코인이 먼저 과열 신호를 낼 수 있다.",
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
        title: "수출과 투자 회복이 겹치며 위험선호가 더 강해진다",
        body: "돈이 다시 움직이기 시작하면서 공격적인 선택이 늘어난다.",
      },
      stocks: {
        title: "반도체와 AI 기대가 본격적으로 주식시장에 퍼진다",
        body: "지수도 따라오지만 업종별 순환매가 특히 빠르게 진행된다.",
      },
      crypto: {
        title: "코인은 과열 전조를 보이며 알트코인 순환매가 붙는다",
        body: "본장보다 먼저 달리는 특유의 선행 흐름이 강해지는 시점이다.",
      },
      safe: {
        title: "금과 환율은 관심권 밖으로 밀리며 쉬어가는 분위기다",
        body: "방어 자산보다 성장 기대에 돈이 붙는 전형적인 구간이다.",
      },
      local: {
        title: "배금시도 체감 경기 회복, 소비 심리가 다시 살아난다",
        body: "생활비 부담은 남아 있지만 쓰는 사람과 움직이는 사람이 늘어난다.",
      },
      preview: {
        title: "6월은 호황기 진입으로 읽히기 쉽다",
        body: "다만 코인이 너무 빨리 달리면 과열도 같이 붙을 수 있다.",
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
        title: "낙관이 시장 전체를 덮으며 강세장이 힘을 받는다",
        body: "실적 기대와 유동성 낙관이 겹쳐 주도 업종이 한 번 더 치고 올라간다.",
      },
      stocks: {
        title: "주식은 강세 추세가 굳어지며 본격 호황장을 만든다",
        body: "지수와 대형주가 동시에 올라오는 보기 드문 편한 장세다.",
      },
      crypto: {
        title: "코인은 주식보다 더 빠르게 달리며 급등 구간으로 진입한다",
        body: "선행 자산답게 수익 기대가 과장되기 쉬운 위험한 달이기도 하다.",
      },
      safe: {
        title: "금과 환율은 약세를 이어가며 방어 자산 매력이 줄어든다",
        body: "자금이 공격 자산으로 이동하면서 안전자산은 한발 물러난다.",
      },
      local: {
        title: "배금시 체감도 호황, 밤거리 상권과 소비가 살아난다",
        body: "사람이 움직이니 공고와 장사 흐름도 눈에 띄게 좋아진다.",
      },
      preview: {
        title: "7월은 과열 신호를 의심해야 한다",
        body: "너무 쉬운 상승은 보통 오래 가지 않는다.",
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
        title: "좋은 흐름은 이어지지만 시장이 과열 경고를 보내기 시작한다",
        body: "이익보다 기대가 더 크게 붙는 순간이어서 피로가 쌓이기 쉽다.",
      },
      stocks: {
        title: "주식은 아직 강하지만 상승 속도가 둔해지며 경계심이 돈다",
        body: "호황장의 끝물인지 더 가는 강세인지 판단이 어려운 달이다.",
      },
      crypto: {
        title: "코인은 정점권 과열로 들어서며 FOMO와 추격 매수가 붙는다",
        body: "주식보다 먼저 꼭지를 논하는 말이 나오는 전형적인 구간이다.",
      },
      safe: {
        title: "금과 환율은 관심 밖으로 밀리며 바닥권에 머문다",
        body: "아직은 안전자산보다 공격 자산 이야기가 훨씬 크게 들린다.",
      },
      local: {
        title: "배금시도 한껏 들뜬 분위기, 소비와 기대가 과장되기 쉽다",
        body: "경기가 좋아 보이는 만큼 과소비와 무리한 베팅도 늘어나는 달이다.",
      },
      preview: {
        title: "8월엔 코인이 먼저 꺾일 수 있다",
        body: "과열이 길수록 차익 실현도 더 거칠게 나온다.",
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
        title: "차익 실현이 늘어나며 시장이 처음으로 흔들리기 시작한다",
        body: "좋은 흐름은 남아 있지만 부담도 동시에 커지는 전환 구간이다.",
      },
      stocks: {
        title: "주식은 고점 부담을 느끼며 상승 피로가 누적된다",
        body: "지수는 버티더라도 개별 종목은 이미 변동성이 커지기 시작한다.",
      },
      crypto: {
        title: "코인은 먼저 꺾이며 상투 논쟁과 급락 경고가 커진다",
        body: "선행 자산의 특성이 뒤집혀 이제는 먼저 무너지는 그림이 나온다.",
      },
      safe: {
        title: "금과 환율은 다시 매수세가 붙으며 반등 조짐을 만든다",
        body: "작은 공포가 다시 방어 자산으로 자금을 돌려놓는 달이다.",
      },
      local: {
        title: "배금시 소비는 남아 있지만 기대감은 살짝 식기 시작한다",
        body: "잘되던 흐름이 흔들리기 시작하면 체감 경기도 빠르게 달라진다.",
      },
      preview: {
        title: "9월은 주식도 본격 조정을 받을 수 있다",
        body: "코인 급락을 가벼운 흔들림으로 보면 늦을 수 있다.",
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
        title: "경기 둔화 우려가 다시 커지며 후퇴장이 굳어지기 시작한다",
        body: "낙관을 걷어내고 숫자를 보기 시작하면 분위기가 빠르게 달라진다.",
      },
      stocks: {
        title: "주식은 실적 실망과 수급 이탈로 조정폭이 더 커진다",
        body: "뒤늦게 가격에 반영되는 본장 조정이 본격화되는 달이다.",
      },
      crypto: {
        title: "코인은 데드캣 반등 뒤 다시 미끄러지며 불안을 키운다",
        body: "선행 자산이 먼저 흔들릴 때의 후폭풍이 생각보다 길게 남는다.",
      },
      safe: {
        title: "금과 환율은 다시 강세를 타며 위험회피 자금이 몰린다",
        body: "방어 자산이 본격적으로 존재감을 되찾는 흐름이다.",
      },
      local: {
        title: "배금시 체감 경기도 다시 차갑게 식으며 소비가 줄어든다",
        body: "좋아 보였던 흐름이 꺾이면 동네 분위기도 눈에 띄게 냉각된다.",
      },
      preview: {
        title: "10월은 공포가 정점으로 번질 수 있다",
        body: "리스크 오프가 커지면 투매가 순식간에 나온다.",
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
        title: "리스크 오프가 정점으로 번지며 시장 전체가 겁을 먹는다",
        body: "위험 회피가 모든 자산 가격에 동시에 반영되는 공포 장세다.",
      },
      stocks: {
        title: "주식은 투매가 나오며 하방 이탈 경고가 커진다",
        body: "버티던 종목들까지 무너지며 체감 하락이 가장 아픈 달이다.",
      },
      crypto: {
        title: "코인은 공포를 가장 먼저 가장 크게 가격에 반영한다",
        body: "청산과 악재가 겹치며 밈 자산과 레버리지가 먼저 무너진다.",
      },
      safe: {
        title: "금과 환율은 강하게 튀며 위험회피 자금의 중심이 된다",
        body: "이 달만큼은 방어 자산의 방향성이 가장 분명하게 드러난다.",
      },
      local: {
        title: "배금시도 지갑을 닫는 분위기, 생활비 압박이 다시 커진다",
        body: "사람들이 소비를 미루기 시작하면 체감 경기 악화가 바로 보인다.",
      },
      preview: {
        title: "11월엔 바닥 다지기 이야기가 나올 수 있다",
        body: "공포가 너무 커지면 오히려 저점 탐색도 같이 시작된다.",
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
        title: "완화 기대가 살아나며 시장이 바닥을 다시 가늠하기 시작한다",
        body: "공포는 남아 있지만 더 나빠지기만 하진 않을 거라는 말이 늘어난다.",
      },
      stocks: {
        title: "주식은 낙폭이 줄며 저점 매수와 관망세가 부딪힌다",
        body: "강한 반등은 아니지만 바닥 신호를 찾는 움직임은 분명해진다.",
      },
      crypto: {
        title: "코인은 다시 먼저 반등을 시도하며 분위기를 살핀다",
        body: "선행 자산 특성상 회복 기대도 주식보다 먼저 가격에 담기기 시작한다.",
      },
      safe: {
        title: "금과 환율은 강세가 둔화되며 방향성이 조금 약해진다",
        body: "방어 자산 강세가 끝났다고 보긴 이르지만 속도는 둔해진다.",
      },
      local: {
        title: "배금시도 숨은 돌리지만 아직은 조심스러운 소비가 많다",
        body: "최악은 지난 듯 보이지만 사람들은 쉽게 지갑을 열지 않는다.",
      },
      preview: {
        title: "12월엔 재반등 기대가 붙을 수 있다",
        body: "연말 랠리를 믿는 쪽과 경계하는 쪽이 같이 늘어날 달이다.",
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
        title: "연말 기대가 살아나며 시장이 다시 한 번 반등을 시도한다",
        body: "다음 해 회복 기대가 붙으며 자금 흐름이 조금씩 공격적으로 바뀐다.",
      },
      stocks: {
        title: "주식은 선택적 반등으로 연말 랠리 기대를 만든다",
        body: "모든 종목이 오르진 않지만 방향성은 다시 위를 보기 시작한다.",
      },
      crypto: {
        title: "코인은 기술적 반등이 더 강하게 붙으며 심리를 먼저 되돌린다",
        body: "주식보다 빠른 선행 흐름이 다시 살아나며 기대감을 크게 키운다.",
      },
      safe: {
        title: "금과 환율은 안정권으로 들어가며 급한 움직임이 줄어든다",
        body: "방어 자산의 긴장감은 완화되고 다시 균형을 찾는 흐름이다.",
      },
      local: {
        title: "배금시도 연말 기대감이 돌며 소비와 이동이 조금씩 늘어난다",
        body: "한 해를 마무리하며 다음 흐름을 준비하는 공기가 도시를 감싼다.",
      },
      preview: {
        title: "연간 사이클의 마지막 달이다",
        body: "다음 판에서는 같은 흐름을 기억하고 더 빠르게 대응할 수 있다.",
      },
    },
  },
};
