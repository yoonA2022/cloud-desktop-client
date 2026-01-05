/**
 * 重装系统相关类型定义
 */

/**
 * 主机类型
 */
export type HostType = 'cloud' | 'dcim' | 'dcimcloud';

/**
 * 重装系统请求参数
 */
export interface ReinstallRequest {
  /** 主机ID */
  id: string | number;
  /** 主机类型（决定使用哪个 API 路径） */
  hostType: HostType;
  /** 操作系统ID */
  os: string | number;
  /** 操作系统分组ID（可选，DCIM 类型使用） */
  os_group?: string | number;
  /** 密码(六位以上且由大小写字母数字三种组成) */
  password: string;
  /** 端口号（Linux默认22，Windows默认3389） */
  port?: number;
  /** 分区(0默认1附加配置，DCIM 类型使用) */
  action?: number;
  /** 分区类型(windows才有0全盘格式化1第一分区格式化，DCIM 类型使用) */
  part_type?: number;
  /** 磁盘号(从0开始分区为附加配置时不需要，DCIM 类型使用) */
  disk?: number;
  /** 附加配置ID（可选，DCIM 类型使用） */
  mcon?: string;
  /** 是否验证磁盘大小（0=不验证，1=验证，DCIM 类型使用） */
  check_disk_size?: number;
  /** 二次验证码（如果启用了二次验证，DCIM 类型使用） */
  code?: string;
}

/**
 * 重装系统响应数据
 */
export interface ReinstallResponseData {
  /** 失败时可能会返回,true弹出确认框取消或者继续安装 */
  confirm?: string;
  /** 重装次数价格(返回该参数说明已达上限并且可以购买重装次数) */
  price?: string;
}

/**
 * 重装系统响应
 */
export interface ReinstallResponse {
  /** 状态码: 200成功, 201/203/204/400/401/406失败 */
  status: number;
  /** 提示信息 */
  msg: string;
  /** 响应数据 */
  data?: ReinstallResponseData;
}
