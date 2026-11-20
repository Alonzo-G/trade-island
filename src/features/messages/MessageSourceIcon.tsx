import qqIcon from "../../assets/brands/qq.png";
import whatsappIcon from "../../assets/brands/whatsapp.svg";
import telegramIcon from "../../assets/brands/telegram.svg";
import wechatIcon from "../../assets/brands/wechat.png";
import qqMailIcon from "../../assets/brands/qq-mail.png";
import { isOfficeSource, type MessageSource } from "./messagePreview";
import { NativePluginIcon } from "../plugins";
import { Puzzle } from "lucide-react";
import "./MessageSourceIcon.css";

const SOURCE_ICONS: Record<"qq" | "wechat" | "qqMail", string> = {
  qq: qqIcon,
  wechat: wechatIcon,
  qqMail: qqMailIcon,
};

/** Radar sources keyed by the snapshot's appId; the QQ toast keeps its own brand icon. */
const RADAR_ICONS: Record<string, string> = {
  whatsapp: whatsappIcon,
  telegram: telegramIcon,
};

export function MessageSourceIcon({ source, icon, size = 16 }: { source: MessageSource; icon?: string; size?: number }) {
  const radar = icon !== undefined ? RADAR_ICONS[icon] : undefined;
  if (radar) return <img className={`message-brand-icon message-brand-icon--radar-${icon}`} src={radar} alt="" aria-hidden="true" width={size} height={size} draggable={false} />;
  if (source === "plugin") {
    const badge = ({ wework: "W", dingtalk: "D", feishu: "F" } as Record<string, string>)[icon ?? ""];
    return badge ? <span className={`message-plugin-badge message-plugin-badge--${icon}`} style={{ width: size, height: size }} aria-hidden="true">{badge}</span> : <Puzzle size={size} aria-hidden="true" />;
  }
  if (isOfficeSource(source)) return <NativePluginIcon id={source} size={size} className={`message-brand-icon message-brand-icon--${source}`} />;
  return <img className={`message-brand-icon message-brand-icon--${source}`} src={SOURCE_ICONS[source]} alt="" aria-hidden="true" width={size} height={size} draggable={false} />;
}
