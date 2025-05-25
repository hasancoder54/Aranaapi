const fetch = require("node-fetch");

module.exports = async (req, res) => {
    const { username } = req.query;
    if (!username) return res.status(400).json({ error: "username parametresi gerekli" });

    try {
        const userData = await fetch("https://users.roblox.com/v1/usernames/users", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ usernames: [username], excludeBannedUsers: false })
        }).then(res => res.json());

        if (!userData.data || userData.data.length === 0) {
            return res.status(404).json({ error: "Kullanıcı bulunamadı" });
        }

        const user = userData.data[0];

        const userInfo = await fetch(`https://users.roblox.com/v1/users/${user.id}`).then(res => res.json());

        const avatar = await fetch(`https://thumbnails.roblox.com/v1/users/avatar?userIds=${user.id}&size=420x420&format=Png&isCircular=false`).then(res => res.json());

        const groups = await fetch(`https://groups.roblox.com/v2/users/${user.id}/groups/roles`).then(res => res.json());

        res.json({
            id: user.id,
            username: user.name,
            displayName: user.displayName,
            profile: `https://www.roblox.com/users/${user.id}/profile`,
            avatar: avatar.data[0]?.imageUrl || null,
            created: userInfo.created,
            isBanned: userInfo.isBanned,
            groups: groups.data.map(g => ({
                name: g.group.name,
                role: g.role.name
            }))
        });
    } catch (err) {
        res.status(500).json({ error: "Sunucu hatası", details: err.message });
    }
};
