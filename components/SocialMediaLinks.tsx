import DiscordIcon from "@/components/svg/socialMedia/DiscordIcon";
import MediumIcon from "@/components/svg/socialMedia/MediumIcon";
import RedditIcon from "@/components/svg/socialMedia/RedditIcon";
import TelegramIcon from "@/components/svg/socialMedia/TelegramIcon";
import TwitterIcon from "@/components/svg/socialMedia/TwitterIcon";
import YoutubeIcon from "@/components/svg/socialMedia/YoutubeIcon";

export default function SocialMediaLinks() {
  return <>
    <a href="https://twitter.com/Popcorn_DAO">
      <TwitterIcon color={"#353945"} size={"24"} />
    </a>
    <a href="https://discord.gg/NYgNA6wv">
      <DiscordIcon color={"#353945"} size={"24"} />
    </a>
    <a href="https://t.me/popcorndaochat">
      <TelegramIcon color={"#353945"} size={"24"} />
    </a>
    <a href="https://medium.com/popcorndao">
      <MediumIcon color={"#353945"} size={"24"} />
    </a>
    <a href="https://www.reddit.com/r/popcorndao/">
      <RedditIcon color={"#353945"} size={"24"} />
    </a>
    <a href="https://www.youtube.com/channel/UCe8n8mGG4JR7nhFT4v9APyA">
      <YoutubeIcon color={"#353945"} size={"24"} />
    </a>
  </>
}
