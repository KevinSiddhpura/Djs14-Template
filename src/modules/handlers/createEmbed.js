const { EmbedBuilder } = require("discord.js");

const SetupEmbed = {
  Author: String,
  AuthorIcon: String,
  AuthorURL: String,
  URL: String,
  Title: String,
  Description: String,
  Fields: [{ Name: String, Value: String, Inline: Boolean }],
  Footer: String,
  FooterIcon: String,
  Thumbnail: String,
  Image: String,
  Color: String,
  Timestamp: Number || String || Boolean,
};

module.exports = (/**@type {SetupEmbed} */ settings) => {
  const {
    Author = null, AuthorIcon = null,
    AuthorURL = null, URL = null, Title = null,
    Description = null, Fields = [],
    Footer = null, FooterIcon = null, Thumbnail = null,
    Image = null, Color = "2f3136", Timestamp = null,
  } = { ...settings };

  const Embed = new EmbedBuilder();

  if (!Author && !AuthorIcon && !AuthorURL && !URL && !Title && !Description && !Footer && !FooterIcon && !Thumbnail && !Image && !Color && !Timestamp && !Fields.length) {
    return Embed.setDescription("No settings provided");
  }

  if (Title) Embed.setTitle(Title);
  if (Description) Embed.setDescription(Description);
  if (URL) Embed.setURL(URL);
  if (Thumbnail) Embed.setThumbnail(Thumbnail);
  if (Image) Embed.setImage(Image);
  if (Color) Embed.setColor(Color);
  if (Timestamp) Embed.setTimestamp(Date.now());

  if (Author && AuthorIcon && AuthorURL) {
    Embed.setAuthor({ name: Author, iconURL: AuthorIcon, url: AuthorURL });
  } else if (Author && AuthorIcon) {
    Embed.setAuthor({ name: Author, iconURL: AuthorIcon });
  } else if (Author && AuthorURL) {
    Embed.setAuthor({ name: Author, url: AuthorURL });
  } else if (Author) {
    Embed.setAuthor({ name: Author });
  }

  if (Footer && FooterIcon) {
    Embed.setFooter({ text: Footer, iconURL: FooterIcon });
  } else if (Footer) {
    Embed.setFooter({ text: Footer });
  }

  if (Array.isArray(Fields) && Fields.length > 0) {
    Embed.addFields(
      Fields.map((field) => ({
        name: field.Name,
        value: field.Value,
        inline: !!field.Inline,
      }))
    );
  }

  return Embed;
};