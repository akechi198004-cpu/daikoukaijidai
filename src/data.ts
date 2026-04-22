import { Port, Product, PlayerState, Quest } from './types';

export const PRODUCTS: Product[] = [
  { id: 'grain', name: '粮食', basePrice: 12, volume: 1, description: '基础生存物资' },
  { id: 'wood', name: '木材', basePrice: 20, volume: 2, description: '造船的基础材料' },
  { id: 'cloth', name: '布料', basePrice: 40, volume: 2, description: '轻便的纺织品' },
  { id: 'wine', name: '葡萄酒', basePrice: 60, volume: 1, description: '海员们的最爱' },
  { id: 'dye', name: '染料', basePrice: 70, volume: 1, description: '昂贵的色彩原料' },
  { id: 'metal', name: '金属', basePrice: 50, volume: 3, description: '沉重但用途广泛' },
  { id: 'medicine', name: '药材', basePrice: 80, volume: 1, description: '罕见的草药' },
  { id: 'spice', name: '香料', basePrice: 120, volume: 1, description: '价值连城的东方粉末' },
];

export const PORTS: Port[] = [
  {
    id: 'aster',
    name: '阿斯特港',
    description: '位于海域中央的繁华商业枢纽，各路商人汇聚于此。',
    x: 50, y: 50,
    priceModifiers: { grain: 0.8, wood: 1.1, cloth: 1.0, wine: 1.0, dye: 1.3, metal: 1.0, medicine: 1.0, spice: 1.2 },
    rumors: ['听说米拉多港极度缺乏粮食，可以去那边卖个好价钱。', '卡洛斯角的香料永远是最便宜的。']
  },
  {
    id: 'mirado',
    name: '米拉多港',
    description: '位于南海贸易线的枢纽，以丰富的香料和布料交易闻名。本港药材紧缺，价格极高。',
    x: 50, y: 15,
    priceModifiers: { grain: 1.4, wood: 0.6, cloth: 1.2, wine: 1.1, dye: 1.0, metal: 0.7, medicine: 3.8, spice: 1.5 },
    rumors: ['严寒让我们无法种植粮食。', '如果能买到香料御寒就好了，价钱不是问题。', '由于最近扩建提防，诺汀湾非常需要木材。']
  },
  {
    id: 'nodin',
    name: '诺汀湾',
    description: '偏居西部的海湾，拥有独特的印染手工艺。',
    x: 10, y: 40,
    priceModifiers: { grain: 1.0, wood: 1.5, cloth: 0.8, wine: 1.2, dye: 0.5, metal: 1.1, medicine: 1.1, spice: 1.0 },
    rumors: ['我们的染料天下第一。', '最近船厂开工，急需大量木材。', '萨贝拉的矿工有病无药，真是可怜。']
  },
  {
    id: 'sabela',
    name: '萨贝拉港',
    description: '南方炎热的深水港，这里的人们擅长冶炼和出产药材。',
    x: 40, y: 85,
    priceModifiers: { grain: 1.1, wood: 1.0, cloth: 1.1, wine: 0.7, dye: 1.2, metal: 1.4, medicine: 0.6, spice: 1.1 },
    rumors: ['我们的药材在米拉多港能卖翻倍！', '这鬼天气，只有葡萄酒能解暑了。卡洛斯角的酒最好。']
  },
  {
    id: 'kalos',
    name: '卡洛斯角',
    description: '东部的神秘异域，气候宜人，遍地果园与香料种植园。',
    x: 85, y: 60,
    priceModifiers: { grain: 0.9, wood: 1.2, cloth: 1.4, wine: 0.6, dye: 1.1, metal: 1.3, medicine: 1.2, spice: 0.4 },
    rumors: ['我们的香料和葡萄酒堆积如山，赶紧运去北方卖吧！', '这里的贵族们很渴望穿上阿斯特港的高级布料。']
  }
];

export const INITIAL_QUESTS: Quest[] = [
  {
    id: 'q1', title: '[贸易] 紧急药品运输', description: '运送 5 单位药材至诺汀湾。',
    giverPortId: 'aster', targetPortId: 'nodin', targetItemId: 'medicine', targetAmount: 5, rewardGold: 2500, deadlineDay: 40, status: 'available'
  },
  {
    id: 'q2', title: '[节庆] 庆典酒水', description: '卡洛斯角即将举办狂欢节，需要大量葡萄酒。',
    giverPortId: 'nodin', targetPortId: 'kalos', targetItemId: 'wine', targetAmount: 10, rewardGold: 1200, deadlineDay: 60, status: 'available'
  },
  {
    id: 'q3', title: '[建设] 大兴土木', description: '由于台风破坏，诺汀湾重建急需大量木材。',
    giverPortId: 'mirado', targetPortId: 'nodin', targetItemId: 'wood', targetAmount: 15, rewardGold: 1000, deadlineDay: 50, status: 'available'
  }
];

export const INITIAL_PLAYER: PlayerState = {
  name: '无名提督',
  gold: 12450,
  day: 14,
  currentPortId: 'mirado',
  shipDurability: 100,
  shipMaxDurability: 100,
  cargoCapacity: 100,
  supplies: 85,
  cargo: { 'cloth': 26, 'spice': 12, 'medicine': 2, 'wine': 5 },
  quests: INITIAL_QUESTS
};
