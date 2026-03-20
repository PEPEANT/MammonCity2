const NPC_DATA = {
  "high-school-girl": {
    id: "high-school-girl",
    name: "골목 여고생",
    role: "student",
    homeLocation: "apt-alley",
    art: CHARACTER_ART.highSchoolGirl.default,
    interactionTypes: ["talk"],
    tags: ["학생", "골목"],
  },
  "alley-office-worker": {
    id: "alley-office-worker",
    name: "퇴근길 직장인",
    role: "office-worker",
    homeLocation: "apt-alley",
    art: CHARACTER_ART.alleyOfficeWorker.default,
    interactionTypes: ["talk"],
    tags: ["직장인", "골목"],
  },
  "alley-aunt": {
    id: "alley-aunt",
    name: "골목 아주머니",
    role: "neighbor",
    homeLocation: "apt-alley",
    art: CHARACTER_ART.alleyAunt.default,
    interactionTypes: ["talk"],
    tags: ["동네 주민", "골목"],
  },
};
