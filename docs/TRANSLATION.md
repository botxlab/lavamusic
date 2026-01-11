# 🌍 Multilanguage support for Lavamusic 🎶

Help us bring Lavamusic to the world!

We use **i18next** with a categorized folder structure to manage translations.

## 🌟 How to add a new language

1. 🔎 **Find the code**  
  Identify the ISO language code supported by Discord (e.g., `en-US`, `es-ES`, `fr`). You can find the list [here](https://discord.com/developers/docs/reference#locales).
2. 📁 **Create directory**  
  Create a new folder in `locales/` with your language code (e.g., `locales/fr/`).
3. 📋 **Copy source**  
  Copy all `.json` files from `locales/en-US/` into your new folder.
4. 🌐 **Translate**  
  Translate the strings in the JSON files to the desired language.

### 📂 Directory structure

Your file structure should look like this:

```text
locales/
├── en-US/              (Source Language)
│   ├── commands.json   (Command names and descriptions)
│   ├── common.json     (UI buttons, generic errors, status)
│   ├── dev.json        (Developer tools)
│   ├── events.json     (Event messages)
│   └── player.json     (Music player responses)
├── es-ES/              (Your New Language)
│   ├── commands.json
│   ├── common.json
│   └── ...
```

### 📚 Available translations

> [!NOTE] Status
> ✅ Available  
> ❌ Unavailable  
> 🤖 AI Translation

| Language           | Code    | Status | Contributors                                                                       |
| :----------------- | :------ | :----: | :--------------------------------------------------------------------------------- |
| 🇺🇸 English (US)    | `en-US` |   ✅   | -                                                                                  |
| 🇧🇬 Bulgarian       | `bg`    |   🤖   | [@Appujet](https://github.com/Appujet)                                             |
| 🇨🇳 Chinese (CN)    | `zh-CN` |   🤖   | [@appujet](https://github.com/Appujet)                                             |
| 🇹🇼 Chinese (TW)    | `zh-TW` |   ✅   | [@apple050620312](https://github.com/apple050620312)                               |
| 🇭🇷 Croatian        | `hr`    |   🤖   | [@Appujet](https://github.com/Appujet)                                             |
| 🇨🇿 Czech           | `cs`    |   🤖   | [@Appujet](https://github.com/Appujet)                                             |
| 🇩🇰 Danish          | `da`    |   🤖   | [@Appujet](https://github.com/Appujet)                                             |
| 🇳🇱 Dutch           | `nl`    |   ✅   | [@Appujet](https://github.com/Appujet)                                             |
| 🇬🇧 English (GB)    | `en-GB` |   ✅   | [@Appujet](https://github.com/Appujet)                                             |
| 🇫🇮 Finnish         | `fi`    |   🤖   | [@Appujet](https://github.com/Appujet)                                             |
| 🇫🇷 French          | `fr`    |   ✅   | [@LucasB25](https://github.com/LucasB25)                                           |
| 🇩🇪 German          | `de`    |   ✅   | [@LucasB25](https://github.com/LucasB25)                                           |
| 🇬🇷 Greek           | `el`    |   🤖   | [@Appujet](https://github.com/Appujet)                                             |
| 🇮🇳 Hindi           | `hi`    |   🤖   | [@Appujet](https://github.com/Appujet)                                             |
| 🇭🇺 Hungarian       | `hu`    |   🤖   | [@Appujet](https://github.com/Appujet)                                             |
| 🇮🇩 Indonesian      | `id`    |   ✅   | [@iaMJ](https://github.com/idMJA)                                                  |
| 🇮🇹 Italian         | `it`    |   ✅   | [@lori28167](https://github.com/lori28167)                                         |
| 🇯🇵 Japanese        | `ja`    |   ✅   | [@hatry4](https://github.com/hatry4)                                               |
| 🇰🇷 Korean          | `ko`    |   ✅   | [@hwangsihu](https://github.com/hwangsihu)                                         |
| 🇱🇹 Lithuanian      | `lt`    |   🤖   | [@Appujet](https://github.com/Appujet)                                             |
| 🇳🇴 Norwegian       | `no`    |   🤖   | [@appujet](https://github.com/Appujet)                                             |
| 🇵🇱 Polish          | `pl`    |   ✅   | [@InfNibor](https://github.com/infnibor), [@LucasB25](https://github.com/LucasB25) |
| 🇧🇷 Portuguese (BR) | `pt-BR` |   ✅   | [@AndreAugustoDev](https://github.com/andreaugustodev)                             |
| 🇵🇹 Portuguese (PT) | `pt-PT` |   ✅   | [@LucasB25](https://github.com/LucasB25)                                           |
| 🇷🇴 Romanian        | `ro`    |   🤖   | [@Appujet](https://github.com/Appujet)                                             |
| 🇷🇺 Russian         | `ru`    |   ✅   | [@LucasB25](https://github.com/LucasB25)                                           |
| 🇪🇸 Spanish (ES)    | `es-ES` |   ✅   | [@LucasB25](https://github.com/LucasB25)                                           |
| 🇸🇪 Swedish         | `sv-SE` |   🤖   | [@Appujet](https://github.com/Appujet)                                             |
| 🇹🇭 Thai            | `th`    |   ✅   | [@fexncns](https://github.com/fexncns)                                             |
| 🇹🇷 Turkish         | `tr`    |   ✅   | [@IlkayAksoy](https://github.com/IlkayAksoy)                                       |
| 🇺🇦 Ukrainian       | `uk`    |   🤖   | [@Appujet](https://github.com/Appujet)                                             |
| 🇻🇳 Vietnamese      | `vi`    |   🤖   | [@nhutlamm](https://github.com/nhutlamm)                                           |

## 📝 Translation Guidelines

- **Do not** change the key names in the translation JSON file.
- **Do not** change the structure of the translation JSON file.
- **Do not** remove the `{}` tags from the strings.
- **Do not** add any new keys to the translation JSON file.

### Example

**Source (`en-US/commands.json`):**
```json
{
  "ping": {
    "description": "Shows the bot's latency.",
    "content": "Pinging...",
    "requested_by": "Requested by {author}"
  }
}
```

**Target (`hi/commands.json`):**
```json
{
  "ping": {
    "description": "बॉट का पिंग दिखाता है।",
    "content": "पिंगिंग...",
    "requested_by": "{author} द्वारा अनुरोधित"
  }
}
```

### 🏷️ Formatting tags for i18next

To ensure `{}` are not removed during translations, use the format tags: `["{", "}"]`.

## 🎉 Have a Language to Contribute?

1. Fork the repository.
2. Duplicate `locales/en-US` and rename the folder to your language code.
3. Translate the files.
4. Create a Pull Request!

## 📚 Resources

- [i18next Documentation](https://www.i18next.com/)
- [Discord Locales List](https://discord.com/developers/docs/reference#locales)
