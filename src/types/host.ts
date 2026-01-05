/**
 * 云电脑主机相关类型定义
 */

/**
 * 主机状态
 */
export type HostStatus =
  | "Pending"      // 待审核
  | "Active"       // 已激活
  | "Suspended"    // 暂停
  | "Terminated"   // 已删除
  | "Cancelled"    // 已取消
  | "Fraud"        // 有欺诈
  | "Completed";   // 已完成

/**
 * 主机信息
 */
export interface Host {
  /** 主机ID */
  id: string;
  /** 机器状态 */
  domainstatus: HostStatus;
  /** 主IP */
  dedicatedip: string;
  /** 分配的IP */
  assignedips: string;
  /** 下次续约日期 */
  nextinvoicedate: string;
  /** 开通时间 */
  regdate: string;
  /** 到期时间 */
  nextduedate: string;
  /** 备注 */
  notes: string;
  /** 续费金额 */
  amount: string;
  /** 周期 */
  billingcycle: string;
  /** 产品名称 */
  productname: string;
  /** 展示周期 */
  cycle_desc: string;
  /** 展示价格 */
  price_desc: string;
  /** 操作系统 */
  os: string;
  /** 操作系统类型（用于判断系统类型，如 windows, Ubuntu 等） */
  os_url: string;
  /** 操作系统图标 */
  svg: string;
  /** 区域代码 */
  area_code: string;
  /** 区域名称 */
  area_name: string;
  /** 主机类型：cloud / dcim / dcimcloud */
  type?: string;
}

/**
 * 区域信息
 */
export interface Area {
  /** 区域代码 */
  code: string;
  /** 区域名称 */
  name: string;
}

/**
 * 权限配置
 */
export interface HostAuth {
  /** 流量图 */
  traffic: "on" | "off";
  /** KVM */
  kvm: "on" | "off";
  /** iKVM */
  ikvm: "on" | "off";
  /** 重置BMC */
  bmc: "on" | "off";
  /** 重装系统 */
  reinstall: "on" | "off";
  /** 重启 */
  reboot: "on" | "off";
  /** 开机 */
  on: "on" | "off";
  /** 关机 */
  off: "on" | "off";
  /** NoVNC */
  novnc: "on" | "off";
  /** 救援系统 */
  rescue: "on" | "off";
  /** 重置密码 */
  crack_pass: "on" | "off";
}

/**
 * 主机列表请求参数
 */
export interface HostListRequest {
  /** 分组ID */
  groupid?: string;
  /** 区域搜索(传名称) */
  dcim_area?: string;
  /** 按状态搜索(数组方式传参) */
  domain_status?: string;
  /** 排序方式 */
  orderby?: "id" | "domainstatus" | "productname" | "regdate" | "nextduedate" | "amount";
  /** 排序类型 */
  sort?: "DESC" | "ASC";
  /** 显示类型：首页index，列表页list */
  show_type?: "index" | "list";
}

/**
 * 主机列表响应
 */
export interface HostListResponse {
  /** 状态码 */
  status: number;
  /** 提示信息 */
  msg: string;
  /** 数据 */
  data: {
    /** 主机列表 */
    list: Host[];
    /** 当前页数 */
    page: number;
    /** 每页条数 */
    limit: number;
    /** 总条数 */
    sum: number;
    /** 总页数 */
    max_page: number;
    /** 排序字段 */
    orderby: string;
    /** 排序方向 */
    sort: string;
    /** 权限配置 */
    auth: HostAuth;
    /** 区域信息 */
    area: Area[];
    /** 产品状态 */
    domainstatus: string;
  };
}
