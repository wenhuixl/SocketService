/**
 * Created by @Evenlai on 2018/07/07
 * 语音编码定义
 */

const Message = {
    _1_NUM_0:{code:1,content:'0',remark:'数字0'},
    _2_NUM_1:{code:2,content:'1',remark:'数字1'},
    _3_NUM_2:{code:3,content:'2',remark:'数字2'},
    _4_NUM_3:{code:4,content:'3',remark:'数字3'},
    _5_NUM_4:{code:5,content:'4',remark:'数字4'},
    _6_NUM_5:{code:6,content:'5',remark:'数字5'},
    _7_NUM_6:{code:7,content:'6',remark:'数字6'},
    _8_NUM_7:{code:8,content:'7',remark:'数字7'},
    _9_NUM_8:{code:9,content:'8',remark:'数字8'},
    _10_NUM_9:{code:10,content:'9',remark:'数字9'},
    _11_LETTER_U_A:{code:11,content:'A',remark:'大写A'},
    _12_LETTER_U_B:{code:12,content:'B',remark:'大写B'},
    _13_LETTER_U_C:{code:13,content:'C',remark:'大写C'},
    _14_LETTER_U_D:{code:14,content:'D',remark:'大写D'},
    _15_LETTER_U_E:{code:15,content:'E',remark:'大写E'},
    _16_LETTER_U_F:{code:16,content:'F',remark:'大写F'},
    _17_LETTER_U_G:{code:17,content:'G',remark:'大写G'},
    _18_LETTER_U_H:{code:18,content:'H',remark:'大写H'},
    _19_LETTER_U_I:{code:19,content:'I',remark:'大写I'},
    _20_LETTER_U_J:{code:20,content:'J',remark:'大写J'},
    _21_LETTER_U_K:{code:21,content:'K',remark:'大写K'},
    _22_LETTER_U_L:{code:22,content:'L',remark:'大写L'},
    _23_LETTER_U_M:{code:23,content:'M',remark:'大写M'},
    _24_LETTER_U_N:{code:24,content:'N',remark:'大写N'},
    _25_LETTER_U_O:{code:25,content:'O',remark:'大写O'},
    _26_LETTER_U_P:{code:26,content:'P',remark:'大写P'},
    _27_LETTER_U_Q:{code:27,content:'Q',remark:'大写Q'},
    _28_LETTER_U_R:{code:28,content:'R',remark:'大写R'},
    _29_LETTER_U_S:{code:29,content:'S',remark:'大写S'},
    _30_LETTER_U_T:{code:30,content:'T',remark:'大写T'},
    _31_LETTER_U_U:{code:31,content:'U',remark:'大写U'},
    _32_LETTER_U_V:{code:32,content:'V',remark:'大写V'},
    _33_LETTER_U_W:{code:33,content:'W',remark:'大写W'},
    _34_LETTER_U_X:{code:34,content:'X',remark:'大写X'},
    _35_LETTER_U_Y:{code:35,content:'Y',remark:'大写Y'},
    _36_LETTER_U_Z:{code:36,content:'Z',remark:'大写Z'},
    _37_MONEY_DIAN:{code:37,content:'点',remark:'点'},
    _38_MONEY_YUAN:{code:38,content:'元',remark:'元'},
    _39_MONEY_JIAO:{code:39,content:'角',remark:'角'},
    _40_MONEY_TIME_FEN:{code:40,content:'分',remark:'分'},
    _41_TIME_HOUR:{code:41,content:'小时',remark:'小时'},
    _42_TIME_SECOND:{code:42,content:'秒',remark:'秒'},
    _43_NUM_TEN:{code:43,content:'十',remark:'十'},
    _44_NUM_TEN_HUNDRED:{code:44,content:'百',remark:'百'},
    _45_NUM_THOUSAND:{code:45,content:'千',remark:'千'},
    _46_NUM_TEN_THOUSAND:{code:46,content:'万',remark:'万'},
    _47_TIME_YEAR:{code:47,content:'年',remark:'年'},
    _48_TIME_MONTH:{code:48,content:'月',remark:'月'},
    _49_TIME_RI:{code:49,content:'日',remark:'日'},
    _50_TIME_TIAN:{code:50,content:'天',remark:'天'},
    _51_PLATE_JING_BEIJING:{code:51,content:'京',remark:'京'},
    _52_PLATE_JIN_TIANJIN:{code:52,content:'津',remark:'津'},
    _53_PLATE_HU_SHANGHAI:{code:53,content:'沪',remark:'沪'},
    _54_PLATE_YU_CHONGQING:{code:54,content:'渝',remark:'渝'},
    _55_PLATE_GUI_GUANGXI:{code:55,content:'桂',remark:'桂'},
    _56_PLATE_NING_NANJING:{code:56,content:'宁',remark:'宁'},
    _57_PLATE_XIN_XINJIANG:{code:57,content:'新',remark:'新'},
    _58_PLATE_ZANG_XIZANG:{code:58,content:'藏',remark:'藏'},
    _59_PLATE_MENG_NEIMENGGU:{code:59,content:'蒙',remark:'蒙'},
    _60_PLATE_JI_HEBEI:{code:60,content:'冀',remark:'冀'},
    _61_PLATE_JIN_SHANXI:{code:61,content:'晋',remark:'晋'},
    _62_PLATE_LIAO_LIAONING:{code:62,content:'辽',remark:'辽'},
    _63_PLATE_JI_JILIN:{code:63,content:'吉',remark:'吉'},
    _64_PLATE_HEI_HEILONGJIANG:{code:64,content:'黑',remark:'黑'},
    _65_PLATE_SU_JIANGSU:{code:65,content:'苏',remark:'苏'},
    _66_PLATE_ZHE_ZHEJIANG:{code:66,content:'浙',remark:'浙'},
    _67_PLATE_WAN_ANHUI:{code:67,content:'皖',remark:'皖'},
    _68_PLATE_MIN_FUJIAN:{code:68,content:'闽',remark:'闽'},
    _69_PLATE_GAN_JIANGXI:{code:69,content:'赣',remark:'赣'},
    _70_PLATE_LU_SHANDONG:{code:70,content:'鲁',remark:'鲁'},
    _71_PLATE_YU_HENAN:{code:71,content:'豫',remark:'豫'},
    _72_PLATE_E_HUBEI:{code:72,content:'鄂',remark:'鄂'},
    _73_PLATE_XIANG_HUNAN:{code:73,content:'湘',remark:'湘'},
    _74_PLATE_YUE_GUANGDONG:{code:74,content:'粤',remark:'粤'},
    _75_PLATE_QIONG_HAINAN:{code:75,content:'琼',remark:'琼'},
    _76_PLATE_CHUAN_SICHUAN:{code:76,content:'川',remark:'川'},
    _77_PLATE_GUI_GUIZHOU:{code:77,content:'贵',remark:'贵'},
    _78_PLATE_YUN_YUNNAN:{code:78,content:'云',remark:'云'},
    _79_PLATE_SHAN_SHANXI:{code:79,content:'陕',remark:'陕'},
    _80_PLATE_GAN_GANSU:{code:80,content:'甘',remark:'甘'},
    _81_PLATE_QING_QINGHAI:{code:81,content:'青',remark:'青'},
    _82_PLATE_XUE:{code:82,content:'学',remark:'学'},
    _83_PLATE_GUA:{code:83,content:'挂',remark:'挂'},
    _84_PLATE_LING:{code:84,content:'领',remark:'领'},
    _85_PLATE_SHI:{code:85,content:'使',remark:'使'},
    _86_PLATE_GANG_XIANGGANG:{code:86,content:'港',remark:'港'},
    _87_PLATE_AO_AOMEN:{code:87,content:'澳',remark:'澳'},
    _88_PLATE_JING:{code:88,content:'警',remark:'警'},
    _89_PLATE_KONG:{code:89,content:'空',remark:'空'},
    _90_PLATE_JUN:{code:90,content:'军',remark:'军'},
    _91_PLATE_BEI:{code:91,content:'北',remark:'北'},
    _92_PLATE_SHEN:{code:92,content:'沈',remark:'沈'},
    _93_PLATE_LAN:{code:93,content:'兰',remark:'兰'},
    _94_PLATE_JI:{code:94,content:'济',remark:'济'},
    _95_PLATE_NAN:{code:95,content:'南',remark:'南'},
    _96_PLATE_GUANG:{code:96,content:'广',remark:'广'},
    _97_PLATE_CHENG:{code:97,content:'成',remark:'成'},
    _98_PHRASE_WELCOME:{code:98,content:'欢迎光临',remark:'欢迎光临'},
    _99_PHRASE_WELCOME_NEXT:{code:99,content:'欢迎下次光临',remark:'欢迎下次光临'},
    _100_PHRASE_LEAVE_WITH_WIND:{code:100,content:'祝您一路顺风',remark:'祝您一路顺风'},
    _101_PHRASE_LEAVE_SAFELY:{code:101,content:'祝您一路平安',remark:'祝您一路平安'},
    _102_PHRASE_HELLO:{code:102,content:'您好',remark:'您好'},
    _103_PHRASE_THANKS:{code:103,content:'谢谢',remark:'谢谢'},
    _104_PHRASE_WAIT:{code:104,content:'请稍候',remark:'请稍候'},
    _105_PHRASE_CONTACT_ADMIN:{code:105,content:'请联系管理员',remark:'请联系管理员'},
    _106_PHRASE_HANDLING:{code:106,content:'系统正在处理中',remark:'系统正在处理中'},
    _107_PHRASE_NO_EMPTY_PARK:{code:107,content:'车位已满',remark:'车位已满'},
    _108_PHRASE_REMAIN_PARK:{code:108,content:'剩余车位',remark:'剩余车位'},
    _109_PHRASE_UNRECORD_PLATE:{code:109,content:'车牌不符',remark:'车牌不符'},
    _110_PHRASE_ACCEPT_CHECK:{code:110,content:'请接受检查',remark:'请接受检查'},
    _111_PHRASE_ILLEGAL_PERIOD:{code:111,content:'非法时段',remark:'非法时段'},
    _112_PHRASE_THIS_CAR:{code:112,content:'此车',remark:'此车'},
    _113_PHRASE_THIS_CARD:{code:113,content:'此卡',remark:'此卡'},
    _114_PHRASE_ENTER_NO_DEAL:{code:114,content:'入场未处理',remark:'入场未处理'},
    _115_PHRASE_NO_ENTER_RECORD:{code:115,content:'无进场记录',remark:'无进场记录'},
    _116_PHRASE_LOST:{code:116,content:'已挂失',remark:'已挂失'},
    _117_PHRASE_EXPIRE_AFTER_DAY:{code:117,content:'天后到期',remark:'天后到期'},
    _118_PHRASE_TEM_CAR_PRESS:{code:118,content:'临时车请按取卡键',remark:'临时车请按取卡键'},
    _119_PHRASE_TEM_CAR_ENTER:{code:119,content:'临时车已入场',remark:'临时车已入场'},
    _120_PHRASE_TEM_CAR_OUT:{code:120,content:'临时车出场',remark:'临时车出场'},
    _121_PHRASE_MINUTE:{code:121,content:'分钟',remark:'分钟'},
    _122_PHRASE_PAY_FEE:{code:122,content:'请交费',remark:'请交费'},
    _123_PHRASE_PLATE:{code:123,content:'车牌',remark:'车牌'},
    _124_PHRASE_READ_CARD:{code:124,content:'请读卡',remark:'请读卡'},
    _125_PHRASE_GET_TICKET:{code:125,content:'请取票',remark:'请取票'},
    _126_PHRASE_VALUECARD_ENTER:{code:126,content:'储值卡入场',remark:'储值卡入场'},
    _127_PHRASE_VALUECARD_OUT:{code:127,content:'储值卡出场',remark:'储值卡出场'},
    _128_PHRASE_VALUECARD_EMPTY:{code:128,content:'储值卡余额不足',remark:'储值卡余额不足'},
    _129_PHRASE_REMAIN_SUM:{code:129,content:'余额',remark:'余额'},
    _130_PHRASE_MONTHCARD_SLOT_ZONE:{code:130,content:'月卡车请在感应区刷卡',remark:'月卡车请在感应区刷卡'},
    _131_PHRASE_MONTHCARD_OUT:{code:131,content:'月卡车出场',remark:'月卡车出场'},
    _132_PHRASE_MONTHCARD_ENTER:{code:132,content:'月卡车入场',remark:'月卡车入场'},
    _133_PHRASE_MONTHRENT_CAR_OUT:{code:133,content:'月租车出场',remark:'月租车出场'},
    _134_PHRASE_MONTHCARD_EXPIRE:{code:134,content:'月卡车过期',remark:'月卡车过期'},
    _135_PHRASE_INVALID_PLATE:{code:135,content:'车牌无效',remark:'车牌无效'},
    _136_PHRASE_BAN_PLATE:{code:136,content:'车牌禁用',remark:'车牌禁用'},
    _137_PHRASE_EXPIRED:{code:137,content:'已过期',remark:'已过期'},
    _138_PHRASE_WILL_EXPIRE:{code:138,content:'即将过期',remark:'即将过期'},
    _139_PHRASE_VIPCAR_OUT:{code:139,content:'贵宾车出场',remark:'贵宾车出场'},
    _140_PHRASE_VIPCAR_ENTER:{code:140,content:'贵宾车入场',remark:'贵宾车入场'},
    _141_PHRASE_MONTHCARD_VALIDTIME:{code:141,content:'月卡车有效期',remark:'月卡车有效期'},
    _142_PHRASE_ALIPAY_PAY:{code:142,content:'支付宝支付',remark:'支付宝支付'},
    _143_PHRASE_WECHAT_PAY:{code:143,content:'微信支付',remark:'微信支付'},
    _144_PHRASE_REPEAT_OUT:{code:144,content:'重复出场',remark:'重复出场'},
    _145_PHRASE_REPEAT_ENTER:{code:145,content:'重复入场',remark:'重复入场'},
    _146_PHRASE_MESSAGE_WRONG:{code:146,content:'通讯错误',remark:'通讯错误'},
    _147_PHRASE_EXPIRE_NEED_RECHARGE:{code:147,content:'即将到期，请及时充值',remark:'即将到期，请及时充值'},
    _148_PHRASE_ENTERED:{code:148,content:'已入场',remark:'已入场'},
    _149_PHRASE_VALIDTIME:{code:149,content:'有效期',remark:'有效期'},
    _150_PHRASE_NOPAY_NEED_CHARGE:{code:150,content:'未缴费,请到收费处缴费',remark:'未缴费,请到收费处缴费'},
    _151_PHRASE_OVERTIME_NEED_CHARGE:{code:151,content:'已超时,请回收费处缴费',remark:'已超时,请回收费处缴费'},
    _152_PHRASE_SLOT_AGAIN:{code:152,content:'请重新刷',remark:'请重新刷'},
    _153_PHRASE_TEM_CAR_BAN:{code:153,content:'临时车禁止入场',remark:'临时车禁止入场'},
    _154_PHRASE_PARKING_TIME:{code:154,content:'停车时间',remark:'停车时间'},
    _155_PHRASE_WELCOME_HOME:{code:155,content:'欢迎回家',remark:'欢迎回家'}
};

module.exports = Message;