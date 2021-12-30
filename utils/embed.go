package utils

import (
	"log"
	"strconv"

	"github.com/diamondburned/arikawa/v3/discord"
	"github.com/diamondburned/arikawa/v3/gateway"
	"github.com/diamondburned/arikawa/v3/state"
)

var (
	SuccessColor   discord.Color = 0x3cde5a
	ErrorColor     discord.Color = 0xde413c
	DefaultColor   discord.Color = 0x493cde
	StarboardColor discord.Color = 0xffac33
)

func SendCustomEmbed(s *state.State, c discord.ChannelID, embed discord.Embed) (*discord.Message, error) {
	msg, err := s.SendEmbeds(
		c,
		embed,
	)
	if err != nil {
		log.Printf("Error sending embed: %v", err)
	}
	return msg, err
}

func SendExternalErrorEmbed(s *state.State, c discord.ChannelID, cmdName string, err error) (*discord.Message, error) {
	return SendCustomEmbed(s, c, MakeEmbed("Error running `"+cmdName+"`", err.Error(), ErrorColor))
}

func SendErrorEmbed(s *state.State, e *gateway.InteractionCreateEvent, cmdName string, err error) {
	_, _ = SendEmbed(s, e, "Error running `"+cmdName+"`", err.Error(), ErrorColor)
}

func SendEmbed(s *state.State, e *gateway.InteractionCreateEvent, title string, description string, color discord.Color) (*discord.Message, error) {
	msg, err := s.SendEmbeds(
		e.ChannelID,
		MakeEmbed(title, description, color),
	)
	if err != nil {
		log.Printf("Error sending embed: %v", err)
	}
	return msg, err
}

func SendMessage(s *state.State, e *gateway.InteractionCreateEvent, content string) (*discord.Message, error) {
	msg, err := s.SendMessage(
		e.ChannelID,
		content,
	)
	if err != nil {
		log.Printf("Error sending embed: %v", err)
	}
	return msg, err
}

func CreateEmbedAuthor(member discord.Member) *discord.EmbedAuthor {
	name := member.Nick
	if len(name) == 0 {
		name = member.User.Username
	}

	url := "https://cdn.discordapp.com/avatars/" + strconv.FormatUint(uint64(member.User.ID), 10) + "/" + member.User.Avatar + ".png?size=2048"
	return &discord.EmbedAuthor{Name: name, Icon: url}
}

func CreateMessageLink(guild int64, message *discord.Message, jump bool) string {
	guildID := strconv.FormatInt(guild, 10)
	channel := strconv.FormatInt(int64(message.ChannelID), 10)
	messageID := strconv.FormatInt(int64(message.ID), 10)
	link := "https://discord.com/channels/" + guildID + "/" + channel + "/" + messageID

	if jump {
		return "[Jump!](" + link + ")"
	}
	return link
}

func MakeEmbed(title string, description string, color discord.Color) discord.Embed {
	return discord.Embed{
		Title:       title,
		Description: description,
		Color:       color,
	}
}
