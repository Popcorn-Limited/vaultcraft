import DiscordIcon from "@/components/svg/socialMedia/DiscordIcon";
import MediumIcon from "@/components/svg/socialMedia/MediumIcon";
import RedditIcon from "@/components/svg/socialMedia/RedditIcon";
import TelegramIcon from "@/components/svg/socialMedia/TelegramIcon";
import TwitterIcon from "@/components/svg/socialMedia/TwitterIcon";
import YoutubeIcon from "@/components/svg/socialMedia/YoutubeIcon";

interface SocialMediaLinksProps {
  color: string;
  color2?: string;
  size: string;
}

export default function SocialMediaLinks({ color, color2, size }: SocialMediaLinksProps): JSX.Element {
  return <>
    <a href="https://twitter.com/Popcorn_DAO">
      <TwitterIcon color={color} size={size} />
    </a>
    <a href="https://discord.gg/NYgNA6wv">
      <DiscordIcon color={color} size={size} />
    </a>
    <a href="https://t.me/popcorndaochat">
      <TelegramIcon color={color} size={size} />
    </a>
    <a href="https://medium.com/popcorndao">
      <MediumIcon color={color} color2={color2} size={size} />
    </a>
    <a href="https://www.reddit.com/r/popcorndao/">
      <RedditIcon color={color} size={size} />
    </a>
    <a href="https://www.youtube.com/channel/UCe8n8mGG4JR7nhFT4v9APyA">
      <YoutubeIcon color={color} color2={color2} size={size} />
    </a>
  </>
}
