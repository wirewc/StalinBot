const DISCORD = require('discord.js');
const TEXTICON = require('./Texticon');
const STALINDB = require('./StalinDB');
const CLIENT = new DISCORD.Client();
const EVERYONE_ROLE = '@everyone';
const TOKEN = '';
const DESCRIPTION = 'StalinBot is not love.  StalinBot is hammer used to crush enemy.';
const PREFIX = '&';
const MANAGE_ROLES_PERMISSION = 'MANAGE_ROLES';
const MUTE_MEMBERS_PERMISSION = 'MUTE_MEMBERS';
const BIKES_URL = 'http://imgur.com/a/1guWV'; 
var banList = [];

var FormatDate = function(date)
{
	return (date.getMonth() + 1) + '/'
		+ date.getDate() + '/'
		+ date.getFullYear() + ' '
		+ date.getHours() + ':'
		+ ((date.getMinutes() < 10 ? '0' : '') + date.getMinutes()) + ' UTC';
};

var IsAuthorBot = function(message)
{
	if(message && message.author)
	{
		return message.author.bot;
	}

	return false;
};

var HasChannelPermission = function(message, permission)
{
	if(message && message.member && message.channel)
	{
		var permissions = message.member.permissionsIn(message.channel);

		return permissions.has(permission);
	}

	return false;
};

var CheckIsCommand = function(message)
{
	if(message &&
	message.content &&
	message.content.length > 1 &&
	message.content.startsWith(PREFIX))
	{
		return true;
	}

	return false;
};

var CheckForChannel = function(message)
{
	if(message && message.channel && message.channel.send)
	{
		return true;
	}

	return false;
};

var CheckForAuthor = function(message)
{
	if((message) && (message.author) && (message.author.send))
	{
		return true;
	}

	return false;
};

var CheckForMemberMentions = function(message)
{
	if((message.mentions) && (message.mentions.members) && (message.mentions.members.size > 0))
	{
		return true;
	}

	return false;
};

var CheckForRoleMentions = function(message)
{
	if((message.mentions) && (message.mentions.roles) && (message.mentions.roles.size > 0))
	{
		return true;
	}

	return false;
};

var GetCommandUsage = function(message, usage)
{
	if(CheckForChannel(message))
	{	var embed = new DISCORD.RichEmbed();
		embed.addField('Command Usage', usage, false);

		message.author.send(embed=embed);
	}
};

var GetOtherRoles = function(roles, topRole)
{
	rolesString = '';

	if(roles && topRole)
	{
		// We remove everyone role cause no one cares about that
		// as everyone gets it.  We also remove the top role
		// because it is already shown, we list all other roles
		// with a comma between the roles.
		var filteredRoles = roles.filter(role => (role.name != EVERYONE_ROLE) && (role.name != topRole.name));
		for(var [key, value] of filteredRoles)
		{
			rolesString += value.name;

			if(value != filteredRoles.last())
			{
				rolesString += ', ';
			}
		}
	}

	return rolesString;
};

var PapersCommand = function(message)
{
	if((CheckForChannel(message)) && (HasChannelPermission(message, MANAGE_ROLES_PERMISSION)))
	{
		if(message.channel)
		{
			if(CheckForMemberMentions(message))
			{
				for(var [snowflake, member] of message.mentions.members)
				{
					var embed = new DISCORD.RichEmbed();

					embed.setTitle('Official Papers');
					embed.addField('Name', member.displayName, true);
					embed.addField('ID', member.user.id, true);
					embed.addField('Primary Role', member.highestRole.name, true);
					embed.addField('Joined', FormatDate(member.joinedAt), true);
					embed.addField('Other Roles', GetOtherRoles(member.roles, member.highestRole), true);
					embed.setThumbnail(member.user.displayAvatarURL);
					message.channel.send(':raised_hand: Halt! Inspection, present your papers.', embed=embed)
				}
			}
			else
			{
				message.channel.send('This person is not a part of the motherland.');
			}
		}
	}
};

var GuideCommand = function(message)
{
	if(CheckForChannel(message))
	{
		message.channel.send('http:/\/www.clarity.net/adam/buying-bike.html');
	}
};

var CommandsCommand = function(message)
{
	if(CheckForAuthor(message))
	{
		var embed = new DISCORD.RichEmbed();

		embed.addField('Administration', 'papers, mute, unmute, setautoroles', false);
		embed.addField('General', 'description, sub, subreddit, reddit, bikes', false);
		embed.addField('Information', 'commands, help, newbie, newb, noob, guide', false);
		embed.addField('Fun', 'busa', false);
		embed.addField('Texticon', 'lenny, shrug, flip, fliptable, tableflip, set, settable, tableset', false);
		message.author.send(embed=embed);
	}
};

var FlipTableCommand = function(message)
{
	if(CheckForChannel(message))
	{
		message.channel.send(TEXTICON.GetFlip());
	}
};

var SetTableCommand = function(message)
{
	if(CheckForChannel(message))
	{
		message.channel.send(TEXTICON.GetSet());
	}
};

var SubredditCommand = function(message, subreddits)
{
	if((CheckForChannel(message)) && (subreddits) && (subreddits.length > 0))
	{
		var reply = '';

		for(var i = 0; i < subreddits.length; i++)
		{
			reply += 'https:/\/www.reddit.com/r/' + subreddits[i];
				if(i != subreddits.length - 1)
			{
				reply += '\n';
			}
		}

		message.channel.send(reply);
	}
};

var TexticonCommand = function(message, texticon)
{
	if((CheckForChannel(message)) && (texticon) && (texticon.length > 0))
	{
		message.channel.send(texticon);
	}
};

var MuteCommand = function(message)
{
	if((CheckForChannel(message)) &&
	(CheckForAuthor(message)) &&
	(HasChannelPermission(message, MANAGE_ROLES_PERMISSION)) &&
	(CheckForMemberMentions(message)) &&
	(message.guild) &&
	(message.guild.id))
	{
		for(var [snowflake, member] of message.mentions.members)
		{
			var roles = [];

			if((member.roles) && (member.roles.size > 1))
			{
				for(var [roleSnowflake, role] of member.roles)
				{
					if(role.name != EVERYONE_ROLE)
					{
						roles.push(roleSnowflake);
					}
				}
			}

			if(STALINDB.Mute(snowflake, message.guild.id, roles))
			{
				for(var i = 0; i < roles.length; i++)
				{
					member.setRoles([]);
				}

				message.channel.send('Silence! We have stopped the capitalist propaganda.');
			}
			else
			{
				message.author.send('Member is already muted.');
			}
		}
	}
};

var UnmuteCommand = function(message)
{

	if((CheckForChannel(message)) &&
	(CheckForAuthor(message)) &&
	(HasChannelPermission(message, MANAGE_ROLES_PERMISSION)) &&
	(CheckForMemberMentions(message)) &&
	(message.guild) &&
	(message.guild.id))
	{
		for(var [snowflake, member] of message.mentions.members)
		{
			var roles = STALINDB.Unmute(member.id, message.guild.id);

			if(roles)
			{
				member.setRoles(roles);
				message.channel.send('Welcome back to the motherland comrade.');
			}
			else
			{
				message.author.send('Member isn\'t muted.');
			}
		}
	}
};

var SetAutoRolesCommand = function(message)
{
	if((CheckForChannel(message)) &&
	(CheckForAuthor(message)) &&
	(HasChannelPermission(message, MANAGE_ROLES_PERMISSION)) &&
	(CheckForRoleMentions(message)) &&
	(message.guild) &&
	(message.guild.id))
	{
		var roles = [];
		
		for(var [roleSnowflake, role] of message.mentions.roles)
		{
			if(role.name != EVERYONE_ROLE)
			{
				roles.push(roleSnowflake);
			}
		}
		
		if(STALINDB.SetAutoRoles(message.guild.id, roles))
		{
			message.author.send('Auto roles have been set.');
		}
		else
		{
			message.author.send('Error setting auto roles, contact a StalinBot developer.');
		}
	}
};

var BikesCommand = function(message)
{
	if((CheckForChannel(message)))
	{
		message.channel.send(BIKES_URL);
	}
};

var BusaCommand = function(message)
{
	if(CheckForChannel(message))
	{
		var busa = '```' +
		'S T R E T C H E D  T U R B O  B U S A\n' +
		'T               E  U       B  U     S\n' +
		'R               H  R       R  S     U\n' +
		'E               C  B       U  A S U B\n' +
		'T               T  O B R U T\n' +
		'C               E\n' +
		'H               R\n' +
		'E               T\n' +
		'D E H C T E R T S' +
		'```';

		message.channel.send(busa);
	}
};

var SeenCommand = function(message)
{
	if((CheckForChannel(message)) &&
	(CheckForMemberMentions(message)) &&
	(CheckForAuthor(message)))
	{
		for(var [snowflake, member] of message.mentions.members)
		{
			var username = member.displayName;
			
			if(member.lastMessage)
			{				
				var messageDate = FormatDate(member.lastMessage.createdAt);
				var messageContent = member.lastMessage.cleanContent;
			
				message.channel.send(username + ' last seen at ' + messageDate + ' saying "' + messageContent + '"');
			}
			else
			{
				message.author.send(username + ' has never sent a message here.');
			}
		}
	}
};

CLIENT.on('guildMemberRemove', (member) => {
	if((member) &&
	(member.id) &&
	(member.guild) &&
	(member.guild.id))
	{
		var banIndex = banList.indexOf(member.id);
		
		// Do nothing on a ban.
		if(banIndex != -1)
		{
			banList.splice(banIndex, 1)
			return;
		}
		
		var roles = [];

		if((member.roles) && (member.roles.size > 1))
		{
			for(var [roleSnowflake, role] of member.roles)
			{
				if(role.name != EVERYONE_ROLE)
				{
					roles.push(roleSnowflake);
				}
			}
		}

		STALINDB.Leave(member.id, member.guild.id, roles);
	}
});

CLIENT.on('guildMemberAdd', (member) => {
	if((member) &&
	(member.id) &&
	(member.guild) &&
	(member.guild.id))
	{
		var roles = STALINDB.Join(member.id, member.guild.id);

		if(roles)
		{
			member.setRoles(roles);
		}
		else if(!STALINDB.IsMuted())
		{
			roles = STALINDB.GetAutoRoles(member.guild.id);

			if(roles)
			{
				member.setRoles(roles);
			}
		}
	}
});

CLIENT.on('guildBanAdd', (guild, user) => {
	if((user) &&
	(user.id) &&
	(guild) &&
	(guild.id))
	{
		STALINDB.RemoveRoles(user.id, guild.id);
		banList.push(user.id);
	}
});

CLIENT.on('ready', () => {
	console.log('Logged in');
});

CLIENT.on('message', (message) => {
	if(!IsAuthorBot(message) && CheckForChannel(message) && CheckIsCommand(message))
	{
		var contentWithoutPrefix = message.content.trim().substring(1);
		var spaceIndex = contentWithoutPrefix.indexOf(' ');

		// This is a command without arguments.
		if(spaceIndex == -1)
		{
			switch(contentWithoutPrefix.toLowerCase())
			{
				case 'description':
				{
					message.channel.send(DESCRIPTION);
					break;
				}
				case 'help':
				case 'commands':
				{
					CommandsCommand(message);
					break;
				}
				case 'flip':
				case 'fliptable':
				case 'tableflip':
				{
					FlipTableCommand(message);
					break;
				}
				case 'set':
				case 'settable':
				case 'tableset':
				{
					SetTableCommand(message);
					break;
				}
				case 'lenny':
				{
					TexticonCommand(message, '( ͡° ͜ʖ ͡°)');
					break;
				}
				case 'shrug':
				{
					TexticonCommand(message, '¯\\_(ツ)_/¯');
					break;
				}
				case 'newbie':
				case 'newb':
				case 'noob':
				case 'guide':
				{
					GuideCommand(message);
					break;
				}
				case 'papers':
				case 'sub':
				case 'subreddit':
				case 'reddit':
				{
					GetCommandUsage(message, PREFIX + contentWithoutPrefix + ' arg1 arg2 ...');
					break;
				}
				case 'bikes':
				{
					BikesCommand(message);
					break;
				}
				case 'busa':
				{
					BusaCommand(message);
					break;
				}
				default:
				{
				}
			}
		}
		// Arguments
		else
		{
			command = contentWithoutPrefix.substr(0, spaceIndex).toLowerCase();
			contentWithoutCommand = contentWithoutPrefix.substring(spaceIndex + 1);
			arguments = contentWithoutCommand.match(/\S+/g);

			switch(command)
			{
				case 'papers':
				{
					PapersCommand(message);
					break;
				}
				case 'sub':
				case 'subreddit':
				case 'reddit':
				{
					SubredditCommand(message, arguments);
					break;
				}
				case 'mute':
				{
					MuteCommand(message);
					break;
				}
				case 'unmute':
				{
					UnmuteCommand(message);
					break;
				}
				case 'setautoroles':
				{
					SetAutoRolesCommand(message);
					break;
				}
				/*case 'seen':
				{
					SeenCommand(message);
					break;
				}*/
				default:
				{
				}
			}
		}
	}
});

CLIENT.login(TOKEN);

/*
@BOT.command(pass_context=True)
async def mute(ctx, member: discord.Member=None):
	if hasPermission(ctx, 'manage_roles'):
		if member:
			print(str(datetime.now()) + ' '
			+ ctx.message.author.id + ' '
			+ ctx.message.author.name + ' muting user ' 
			+ member.id + ' '
			+ member.name)

			roleIDs = []
			roleNames = []

			for role in member.roles:
				if role.name != EVERYONE_ROLE:
					roleIDs.append(role.id)
					roleNames.append(role.name)

			DB.insert({'userID': member.id,
			'name': member.name,
			'roleIDs': roleIDs,
			'roleNames': roleNames})
			await BOT.replace_roles(member)
			await BOT.say('We have silenced the capitalist propaganda, comrades!')
		else:
			await BOT.say(embed=helpEmbed('&mute @tag'))

@BOT.command(pass_context=True)
async def unmute(ctx, member: discord.Member=None):
	if hasPermission(ctx, 'manage_roles'):
		if member and ctx.message.server:
			print(str(datetime.now()) + ' '
			+ ctx.message.author.id + ' '
			+ ctx.message.author.name  + ' unmuting user '
			+ member.id + ' '
			+ member.name)

			q = Query()
			entries = DB.search(q.userID == member.id)
			roles = []

			if entries:
				for roleID in entries[0].get('roleIDs'):
					for role in ctx.message.server.roles:
						if roleID == role.id:
							roles.append(role)

			await BOT.add_roles(member, *roles)
			DB.remove(q.userID == member.id)
		else:
			await BOT.say(embed=helpEmbed('&unmute @tag'))


*/
