package handler

import (
	"log"

	"github.com/diamondburned/arikawa/v3/api"
	"github.com/diamondburned/arikawa/v3/discord"
	"github.com/diamondburned/arikawa/v3/gateway"
	"github.com/diamondburned/arikawa/v3/state"
	"github.com/diamondburned/arikawa/v3/utils/json/option"
	"github.com/jcdea/discordbotthing/utils"
)

func HandleButton(s *state.State, e *gateway.InteractionCreateEvent, guildID discord.GuildID, data *discord.ButtonInteraction) api.InteractionResponse {

	userRoleID := discord.RoleID(utils.MustSnowflakeEnv("USER_ROLE_ID"))
	switch data.CustomID {
	case "rules_button":
		log.Println("rules_button called")
		s.AddRole(guildID, e.Sender().ID, userRoleID, api.AddRoleData{})
		return api.InteractionResponse{
			Type: api.MessageInteractionWithSource, Data: &api.InteractionResponseData{
				Content: option.NewNullableString("정상적으로 처리되었습니다."),
				Flags:   api.EphemeralResponse,
			}}
	}
	return api.InteractionResponse{Type: api.PongInteraction}
}
