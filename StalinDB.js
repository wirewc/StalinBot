const DB = require('diskdb')
	.connect('./')
	.loadCollections(['Members', 'Guilds', 'MemberGuild', 'MemberGuildRoles', 'GuildAutoRoles']);

const ROLESTATUSBITFLAGS = {
	muted: 1,
	left: 2
};

var AddMember = function(memberSnowflake)
{
	var query = {snowflake: memberSnowflake};

	return DB.Members.save(query);
};

var GetMember = function(memberSnowflake)
{
	var query = {snowflake: memberSnowflake};
	var member = DB.Members.findOne(query);

	if(member)
	{
		return member;
	}
	else
	{
		return AddMember(memberSnowflake);
	}
};

var AddGuild = function(guildSnowflake)
{
	var query = {snowflake: guildSnowflake};

	return DB.Guilds.save(query);
};

var GetGuild = function(guildSnowflake)
{
	var query = {snowflake: guildSnowflake};
	var guild = DB.Guilds.findOne(query);

	if(guild)
	{
		return guild;
	}
	else
	{
		return AddGuild(guildSnowflake);
	}
};

// These should be diskdb IDs not discord snowflakes.
var AddMemberGuild = function(memberID, guildID)
{
	var query = {memberID: memberID, guildID: guildID};

	return DB.MemberGuild.save(query);
};

// These should be diskdb IDs not discord snowflakes.
var GetMemberGuild = function(memberID, guildID)
{
	var query = {memberID: memberID, guildID: guildID};
	var memberGuild = DB.MemberGuild.findOne(query);

	if(memberGuild)
	{
		return memberGuild;
	}
	else
	{
		return AddMemberGuild(memberID, guildID);
	}
};

// This should be a diskdb MemberGuildRoles._id
var RemoveMemberGuildRoles = function(memberGuildRolesID)
{
	var query = {_id: memberGuildRolesID};

	return DB.MemberGuildRoles.remove(query);
};

var UpdateMemberGuildRolesStatus = function(memberGuildRolesID, status)
{
	var query = {memberGuildRolesID};
	var update = {status: status};
	var options = {multi: false, upsert: false};

	return DB.MemberGuildRoles.update(query, update, options);
};

// This should be a diskDB MemberGuild._id and discord role snowflakes list.
var AddMemberGuildRoles = function(memberGuildID, roles, status)
{
	var query = {memberGuildID: memberGuildID, roles: roles, status: status};

	return DB.MemberGuildRoles.save(query);
};

// This should be a diskdb MemberGuild._id
var GetMemberGuildRoles = function(memberGuildID)
{
	var query = {memberGuildID: memberGuildID};

	return DB.MemberGuildRoles.findOne(query);
};

var SetGuildAutoRoles = function(guildID, roles)
{
	var query = {guildID: guildID};
	var update = {guildID: guildID, roles: roles};
	var options = {multi: false, upsert: true};
	
	return DB.GuildAutoRoles.update(query, update, options);
};

var GetGuildAutoRoles = function(guildID)
{
	var query = {guildID: guildID};
	
	return DB.GuildAutoRoles.findOne(query);
};

var AddRoles = function(memberSnowflake, guildSnowflake, roles, roleStatus)
{
	var member = GetMember(memberSnowflake);
	var guild = GetGuild(guildSnowflake);

	if((member) && (member._id) && (guild) && (guild._id))
	{
		var memberGuild = GetMemberGuild(member._id, guild._id);

		if((memberGuild) && (memberGuild._id))
		{
			var memberGuildRoles = GetMemberGuildRoles(memberGuild._id);

			// If we don't currently have an entry make one
			// with muted status.
			if(!memberGuildRoles)
			{
				return AddMemberGuildRoles(memberGuild._id, roles, roleStatus);
			}
			// Otherwise if we have an entry and that entry
			// doesn't have a muted status, update that entry
			// to add the muted status.
			else if((memberGuildRoles.status & roleStatus) != roleStatus)
			{
				return UpdateMemberGuildRolesStatus(memberGuildRoles._id, memberGuildRoles.status | roleStatus);
			}
		}
	}
};

var RestoreRoles = function(memberSnowflake, guildSnowflake, statusToUndo)
{
	var member = GetMember(memberSnowflake);
	var guild = GetGuild(guildSnowflake);

	if((member) && (member._id) && (guild) && (guild._id))
	{
		var memberGuild = GetMemberGuild(member._id, guild._id);

		if((memberGuild) && (memberGuild._id))
		{
			var memberGuildRoles = GetMemberGuildRoles(memberGuild._id);

			if(memberGuildRoles)
			{
				// If we have an entry, and that entry only has a
				// status flag sent on it, we remove it.
				if(memberGuildRoles.status == statusToUndo)
				{
					RemoveMemberGuildRoles(memberGuildRoles._id);
					return memberGuildRoles.roles;
				}
				// Otherwise we check to see if the status
				// includes the muted flag.  If it does we
				// update the status to remove the status sent flag.
				else if((memberGuildRoles.status & ROLESTATUSBITFLAGS.muted) == ROLESTATUSBITFLAGS.muted)
				{
					UpdateMemberGuildRolesStatus(memberGuildRoles._id, memberGuildRoles.status ^ statusToUndo);
				}
			}
		}
	}
};

exports.RemoveRoles = function(memberSnowflake, guildSnowflake)
{
	var member = GetMember(memberSnowflake);
	var guild = GetGuild(guildSnowflake);

	if((member) && (member._id) && (guild) && (guild._id))
	{
		var memberGuild = GetMemberGuild(member._id, guild._id);

		if((memberGuild) && (memberGuild._id))
		{
			var memberGuildRoles = GetMemberGuildRoles(memberGuild._id);

			if(memberGuildRoles)
			{
				RemoveMemberGuildRoles(memberGuildRoles._id);
			}
		}
	}
};

exports.Mute = function(memberSnowflake, guildSnowflake, roles)
{
	return AddRoles(memberSnowflake, guildSnowflake, roles, ROLESTATUSBITFLAGS.muted);
};

exports.Unmute = function(memberSnowflake, guildSnowflake)
{
	return RestoreRoles(memberSnowflake, guildSnowflake, ROLESTATUSBITFLAGS.muted);
};

exports.IsMuted = function(memberSnowflake, guildSnowflake)
{
	var member = GetMember(memberSnowflake);
	var guild = GetGuild(guildSnowflake);

	if((member) && (member._id) && (guild) && (guild._id))
	{
		var memberGuild = GetMemberGuild(member._id, guild._id);

		if((memberGuild) && (memberGuild._id))
		{
			var memberGuildRoles = GetMemberGuildRoles(memberGuild._id);

			if(memberGuildRoles)
			{
				return true;
			}
		}
	}
	
	return false;
};

exports.Leave = function(memberSnowflake, guildSnowflake, roles)
{
	return AddRoles(memberSnowflake, guildSnowflake, roles, ROLESTATUSBITFLAGS.left);
};

exports.Join = function(memberSnowflake, guildSnowflake)
{
	return RestoreRoles(memberSnowflake, guildSnowflake, ROLESTATUSBITFLAGS.left);
};

exports.SetAutoRoles = function(guildSnowflake, roles)
{
	var guild = GetGuild(guildSnowflake);
	
	if((guild) && (guild._id))
	{
		return SetGuildAutoRoles(guild._id, roles);
	}
};

exports.GetAutoRoles = function(guildSnowflake)
{
	var guild = GetGuild(guildSnowflake);
	
	if((guild) && (guild._id))
	{
		var guildAutoRoles = GetGuildAutoRoles(guild._id);
		
		if(guildAutoRoles)
		{
			return guildAutoRoles.roles;
		}
	}
};
