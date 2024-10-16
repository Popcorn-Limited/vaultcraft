import DiscordIcon from "@/components/svg/socialMedia/DiscordIcon";
import MediumIcon from "@/components/svg/socialMedia/MediumIcon";
import TwitterIcon from "@/components/svg/socialMedia/TwitterIcon";
import YoutubeIcon from "@/components/svg/socialMedia/YoutubeIcon";
import TelegramIcon from "@/components/svg/socialMedia/TelegramIcon";

interface SocialMediaLinksProps {
  color: string;
  color2?: string;
  size: string;
}

export default function SocialMediaLinks({
  color,
  color2,
  size,
}: SocialMediaLinksProps): JSX.Element {
  return (
    <>
      <a href="https://twitter.com/VaultCraft_io" target="_blank">
        <TwitterIcon color={color} size={size} />
      </a>
      <a href="https://discord.com/invite/kgCun7SbkR" target="_blank">
        <DiscordIcon color={color} size={size} />
      </a>
      <a href="https://t.me/vaultcraft" target="_blank">
        <TelegramIcon color={color} size={size} />
      </a>
      <a href="https://medium.com/vaultcraft" target="_blank">
        <MediumIcon color={color} color2={color2} size={size} />
      </a>
      <a
        href="https://www.youtube.com/channel/UCe8n8mGG4JR7nhFT4v9APyA"
        target="_blank"
      >
        <YoutubeIcon color={color} color2={color2} size={size} />
      </a>
    </>
  );
}
