package handler

import (
	"errors"
	"log"

	"github.com/diamondburned/arikawa/v3/api"
	"github.com/diamondburned/arikawa/v3/discord"
	"github.com/diamondburned/arikawa/v3/gateway"
	"github.com/diamondburned/arikawa/v3/state"
	"github.com/team-int/Forum-bot/cmd"
	"github.com/team-int/Forum-bot/utils"
)

func isAdmin(roles []discord.RoleID) bool {
	adminRoleID := discord.RoleID(utils.MustSnowflakeEnv("ADMINROLE_ID"))
	for _, id := range roles {
		if id == adminRoleID {
			return true
		}
	}
	return false
}

func adminHandler(s *state.State, e *gateway.InteractionCreateEvent, data *discord.CommandInteraction) api.InteractionResponse {
	userID := e.Sender().ID
	sender, err := s.Member(e.GuildID, userID)
	if err != nil {
		utils.SendErrorEmbed(s, e, "admin", err)
	}

	if !isAdmin(sender.RoleIDs) {
		utils.SendErrorEmbed(s, e, "admin", errors.New("이 서버의 관리자가 아닙니다."))
	}

	switch data.Options[0].Name {
	case "button":
		log.Println("admin button called")
		return cmd.AdminButton(s, e, data.Options[0])

	default:
		return cmd.CommandNotFound(data)

	}

}
