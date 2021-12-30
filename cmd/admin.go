package cmd

import (
	"log"

	"github.com/diamondburned/arikawa/v3/api"
	"github.com/diamondburned/arikawa/v3/discord"
	"github.com/diamondburned/arikawa/v3/gateway"
	"github.com/diamondburned/arikawa/v3/state"
	"github.com/team-int/Forum-bot/utils"
)

func AdminButton(s *state.State, e *gateway.InteractionCreateEvent, data discord.CommandInteractionOption) api.InteractionResponse {
	var channelID discord.ChannelID
	var title string
	var text string
	var buttonText string

	for _, option := range data.Options {
		switch option.Name {
		case "channel":

			snow, err := option.SnowflakeValue()
			if err != nil {
				log.Println(err)
				utils.SendErrorEmbed(s, e, "admin button", err)
				break
			}
			channelID = discord.ChannelID(snow)
			break

		case "title":
			title = option.String()
			break

		case "message":
			text = option.String()
			break

		case "buttontext":
			buttonText = option.String()
			break
		}
	}

	s.SendMessageComplex(channelID,
		api.SendMessageData{
			Embeds: []discord.Embed{
				utils.MakeEmbed(title, text, utils.SuccessColor),
			},
			Components: *discord.ComponentsPtr(
				&discord.ActionRowComponent{&discord.ButtonComponent{Label: buttonText, CustomID: "rules_button", Style: discord.PrimaryButtonStyle()}},
			),
		},
	)

	return api.InteractionResponse{
		Type: api.MessageInteractionWithSource,
		Data: &api.InteractionResponseData{
			Embeds: &[]discord.Embed{
				utils.MakeEmbed("성공!", "인증 버튼을 추가했습니다!", utils.SuccessColor),
			},
		},
	}

}
