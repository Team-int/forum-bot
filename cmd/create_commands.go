package cmd

import (
	"log"

	"github.com/diamondburned/arikawa/v3/api"
	"github.com/diamondburned/arikawa/v3/discord"
	"github.com/diamondburned/arikawa/v3/state"
)

func CreateCommands(s *state.State, app *discord.Application, guildID discord.GuildID) {
	log.Println("Getting all guild commands... ")
	commands, err := s.GuildCommands(app.ID, guildID)
	if err != nil {

		log.Fatalln("failed to get guild commands:", err)
	}

	for _, command := range commands {
		s.DeleteGuildCommand(app.ID, guildID, command.ID)
		log.Println("Existing command", command.Name, "found.")
	}

	adminOptions := discord.SubcommandOption{
		OptionName:  "button",
		Description: "선택한 채널에 신규 유저 인증 메세지를 게시합니다.",
		Options: []discord.CommandOptionValue{
			&discord.ChannelOption{
				OptionName:   "channel",
				Description:  "인증 버튼을 추가할 채널",
				Required:     true,
				ChannelTypes: []discord.ChannelType{discord.GuildText}},
			&discord.StringOption{
				OptionName:  "title",
				Description: "인증 메세지의 제목",
				Required:    true,
			},
			&discord.StringOption{
				OptionName:  "message",
				Description: "인증 메세지의 텍스트",
				Required:    true,
			},
			&discord.StringOption{
				OptionName:  "buttontext",
				Description: "인증 버튼의 메세지",
				Required:    true,
			}},
	}

	newCommands := []api.CreateCommandData{
		{
			Name:        "ping",
			Description: "Basic ping command.",
		},
		{
			Name:        "admin",
			Description: "설정을 관리합니다.",
			Options:     []discord.CommandOption{&adminOptions}},
	}
	for _, command := range newCommands {
		_, err := s.CreateGuildCommand(app.ID, guildID, command)
		if err != nil {
			log.Fatalln("failed to create guild command:", err)
		}
	}
}
