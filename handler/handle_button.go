package handler

import (
	"fmt"

	"github.com/diamondburned/arikawa/v3/api"
	"github.com/diamondburned/arikawa/v3/discord"
	"github.com/diamondburned/arikawa/v3/gateway"
	"github.com/diamondburned/arikawa/v3/state"
	"github.com/diamondburned/arikawa/v3/utils/json/option"
	"github.com/team-int/forum-bot/utils"
)

func isUser(roles []discord.RoleID) bool {
	userRoleID := discord.RoleID(utils.MustSnowflakeEnv("USER_ROLE_ID"))
	for _, id := range roles {
		if id == userRoleID {
			return true
		}
	}
	return false
}

func HandleButton(s *state.State, e *gateway.InteractionCreateEvent, guildID discord.GuildID, data *discord.ButtonInteraction) api.InteractionResponse {

	switch data.CustomID {
	case "rules_button":
		welcomeChannel := discord.ChannelID(utils.MustSnowflakeEnv("WElCOME_CHANNEL_ID"))
		userRoleID := discord.RoleID(utils.MustSnowflakeEnv("USER_ROLE_ID"))

		userID := e.Sender().ID
		sender, err := s.Member(e.GuildID, userID)
		if err != nil {
			utils.SendErrorEmbed(s, e, "admin", err)
		}

		if isUser(sender.RoleIDs) {
			return api.InteractionResponse{
				Type: api.MessageInteractionWithSource, Data: &api.InteractionResponseData{
					Content: option.NewNullableString("이미 규칙에 동의하셨습니다."),
					Flags:   api.EphemeralResponse,
				}}
		}

		s.AddRole(guildID, e.Sender().ID, userRoleID, api.AddRoleData{})

		welcomeEmbed := utils.MakeEmbed("환영합니다!",
			fmt.Sprintf(`안녕하세요, <@%d>님! Team int에 오신걸 환영합니다!\n<a:playwithme2:927607561874726964>**모두 새로 온 유저를 환영해주세요!**<a:playwithme:927607523358441473>`,
				e.SenderID()),
			utils.SuccessColor,
		)

		utils.SendCustomEmbed(s, welcomeChannel, welcomeEmbed)

		return api.InteractionResponse{
			Type: api.MessageInteractionWithSource, Data: &api.InteractionResponseData{
				Content: option.NewNullableString("정상적으로 처리되었습니다."),
				Flags:   api.EphemeralResponse,
			}}
	}
	return api.InteractionResponse{Type: api.PongInteraction}
}
