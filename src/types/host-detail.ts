/**
 * 云电脑主机详情相关类型定义
 */

/**
 * 主机基础数据
 */
export interface HostData {
  /** 订单ID */
  ordernum: string;
  /** 产品ID */
  productid: string;
  /** 服务器ID */
  serverid: string;
  /** 产品开通时间 */
  regdate: number;
  /** 主机名 */
  domain: string;
  /** 支付方式 */
  payment: string;
  /** 首付金额 */
  firstpaymentamount: string;
  /** 首付金额描述 */
  firstpaymentamount_desc: string;
  /** 续费金额 */
  amount: string;
  /** 续费金额描述 */
  amount_desc: string;
  /** 付款周期 */
  billingcycle: string;
  /** 付款周期描述 */
  billingcycle_desc: string;
  /** 到期时间 */
  nextduedate: number;
  /** 下次账单时间 */
  nextinvoicedate: number;
  /** 独立IP */
  dedicatedip: string;
  /** 附加IP */
  assignedips: string[];
  /** IP数量 */
  ip_num: number;
  /** 产品状态 */
  domainstatus: string;
  /** 产品状态描述 */
  domainstatus_desc: string;
  /** 服务器用户名 */
  username: string;
  /** 服务器密码 */
  password: string;
  /** 暂停原因 */
  suspendreason: string;
  /** 是否到期取消 */
  auto_terminate_end_cycle: number;
  /** 取消原因 */
  auto_terminate_reason: string;
  /** 产品名称 */
  productname: string;
  /** 产品组名 */
  groupname: string;
  /** 当前使用流量 */
  bwusage: string;
  /** 当前使用流量上限(0表示不限) */
  bwlimit: string;
  /** 操作系统 */
  os: string;
  /** 端口 */
  port: string;
  /** 备注 */
  remark: string;
  /** 是否输出"升级配置项"按钮：1是 */
  allow_upgrade_config: number;
  /** 是否输出"升级产品"按钮：1是 */
  allow_upgrade_product: number;
  /** 是否显示用量图 */
  show_traffic_usage: number;
  /** 主机类型：cloud / dcim / dcimcloud */
  type?: string;
}

/**
 * 配置选项
 */
export interface ConfigOption {
  /** 配置名 */
  name: string;
  /** 配置项值 */
  sub_name: string;
}

/**
 * 自定义字段
 */
export interface CustomField {
  /** 字段名 */
  fieldname: string;
  /** 字段值 */
  value: string;
}

/**
 * 可下载数据
 */
export interface DownloadData {
  /** 文件ID */
  id: string;
}

/**
 * 模块按钮
 */
export interface ModuleButton {
  /** 类型: default默认, custom自定义 */
  type: string;
  /** 函数名 */
  func: string;
  /** 名称 */
  name: string;
}

/**
 * 模块页面输出
 */
export interface ModuleClientArea {
  /** 键值用于获取内容 */
  key: string;
  /** 名称 */
  name: string;
}

/**
 * 流量包
 */
export interface FlowPacket {
  /** 流量包ID */
  id: string;
  /** 流量包名称 */
  name: string;
  /** 价格 */
  price: string;
  /** 销售次数 */
  sale_times: number;
  /** 库存(0不限) */
  stock: number;
}

/**
 * 操作系统分组
 */
export interface OsGroup {
  /** 分组ID */
  id: string;
  /** 分组名称 */
  name: string;
  /** 分组svg号 */
  svg: string;
}

/**
 * 操作系统数据
 */
export interface OsData {
  /** 操作系统ID */
  id: string;
  /** 操作系统名称 */
  name: string;
  /** 操作系统类型(1windows 0linux) */
  ostype: number;
  /** 操作系统真实名称 */
  os_name: string;
  /** 所属分组ID */
  group_id: string;
}

/**
 * 流量包使用情况
 */
export interface FlowPacketUse {
  /** 流量包名称 */
  name: string;
  /** 流量包大小 */
  capacity: string;
  /** 价格 */
  price: string;
  /** 支付时间 */
  pay_time: string;
  /** 已用流量 */
  used: string;
  /** 剩余流量 */
  leave: string;
}

/**
 * 云操作系统
 */
export interface CloudOs {
  /** 操作系统ID */
  id: string;
  /** 名称 */
  name: string;
  /** 分组ID */
  group: string;
}

/**
 * 云操作系统分组
 */
export interface CloudOsGroup {
  /** 分组ID */
  id: string;
  /** 分组名称 */
  name: string;
}

/**
 * DCIM权限
 */
export interface DcimAuth {
  /** 流量图 */
  traffic?: "on" | "off";
  /** KVM */
  kvm?: "on" | "off";
  /** iKVM */
  ikvm?: "on" | "off";
  /** 重置BMC */
  bmc?: "on" | "off";
  /** 重装系统 */
  reinstall?: "on" | "off";
  /** 重启 */
  reboot?: "on" | "off";
  /** 开机 */
  on?: "on" | "off";
  /** 关机 */
  off?: "on" | "off";
  /** NoVNC */
  novnc?: "on" | "off";
  /** 救援系统 */
  rescue?: "on" | "off";
  /** 重置密码 */
  crack_pass?: "on" | "off";
}

/**
 * 主机详情响应数据
 */
export interface HostDetailData {
  /** 基础数据 */
  host_data: HostData;
  /** 可配置选项 */
  config_options: ConfigOption[];
  /** 自定义字段 */
  custom_field_data: CustomField[];
  /** 可下载数据 */
  download_data: DownloadData[];
  /** 模块按钮 */
  module_button: ModuleButton[];
  /** 模块页面输出 */
  module_client_area: ModuleClientArea[];
  /** 钩子输出 */
  hook_output: string[];
  /** 流量包 */
  "dcim.flowpacket"?: FlowPacket[];
  /** DCIM权限 */
  "dcim.auth"?: DcimAuth;
  /** 区域代码 */
  "dcim.area_code"?: string;
  /** 区域名称 */
  "dcim.area_name"?: string;
  /** 操作系统分组 */
  "dcim.os_group"?: OsGroup[];
  /** 操作系统数据 */
  "dcim.os"?: OsData[];
  /** 流量包使用情况 */
  flow_packet_use_list?: FlowPacketUse[];
  /** 云操作系统 */
  cloud_os?: CloudOs[];
  /** 云操作系统分组 */
  cloud_os_group?: CloudOsGroup[];
  /** 系统公司名 */
  "system_config.company_name"?: string;
  /** 远程地址 */
  "dcimcloud.nat_acl"?: string;
  /** 建站解析 */
  "dcimcloud.nat_web"?: string;
  /** 是否请求电源状态 */
  module_power_status?: number;
}

/**
 * 主机详情响应
 */
export interface HostDetailResponse {
  /** 状态码 */
  status: number;
  /** 提示信息 */
  msg: string;
  /** 数据 */
  data: HostDetailData;
}
