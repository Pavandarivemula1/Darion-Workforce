module.exports = [
"[externals]/buffer [external] (buffer, cjs)", ((__turbopack_context__, module, exports) => {

var mod = __turbopack_context__.x("buffer", () => require("buffer"));

module.exports = mod;
}),
"[externals]/child_process [external] (child_process, cjs)", ((__turbopack_context__, module, exports) => {

var mod = __turbopack_context__.x("child_process", () => require("child_process"));

module.exports = mod;
}),
"[externals]/crypto [external] (crypto, cjs)", ((__turbopack_context__, module, exports) => {

var mod = __turbopack_context__.x("crypto", () => require("crypto"));

module.exports = mod;
}),
"[externals]/events [external] (events, cjs)", ((__turbopack_context__, module, exports) => {

var mod = __turbopack_context__.x("events", () => require("events"));

module.exports = mod;
}),
"[externals]/fs [external] (fs, cjs)", ((__turbopack_context__, module, exports) => {

var mod = __turbopack_context__.x("fs", () => require("fs"));

module.exports = mod;
}),
"[externals]/http2 [external] (http2, cjs)", ((__turbopack_context__, module, exports) => {

var mod = __turbopack_context__.x("http2", () => require("http2"));

module.exports = mod;
}),
"[externals]/https [external] (https, cjs)", ((__turbopack_context__, module, exports) => {

var mod = __turbopack_context__.x("https", () => require("https"));

module.exports = mod;
}),
"[externals]/os [external] (os, cjs)", ((__turbopack_context__, module, exports) => {

var mod = __turbopack_context__.x("os", () => require("os"));

module.exports = mod;
}),
"[externals]/process [external] (process, cjs)", ((__turbopack_context__, module, exports) => {

var mod = __turbopack_context__.x("process", () => require("process"));

module.exports = mod;
}),
"[externals]/querystring [external] (querystring, cjs)", ((__turbopack_context__, module, exports) => {

var mod = __turbopack_context__.x("querystring", () => require("querystring"));

module.exports = mod;
}),
"[externals]/stream [external] (stream, cjs)", ((__turbopack_context__, module, exports) => {

var mod = __turbopack_context__.x("stream", () => require("stream"));

module.exports = mod;
}),
"[externals]/url [external] (url, cjs)", ((__turbopack_context__, module, exports) => {

var mod = __turbopack_context__.x("url", () => require("url"));

module.exports = mod;
}),
"[externals]/zlib [external] (zlib, cjs)", ((__turbopack_context__, module, exports) => {

var mod = __turbopack_context__.x("zlib", () => require("zlib"));

module.exports = mod;
}),
"[project]/darion-chat/.next-internal/server/app/page/actions.js { ACTIONS_MODULE0 => \"[project]/darion-chat/src/app/actions/calls.ts [app-rsc] (ecmascript)\", ACTIONS_MODULE1 => \"[project]/darion-chat/src/app/actions/messages.ts [app-rsc] (ecmascript)\", ACTIONS_MODULE2 => \"[project]/darion-chat/src/app/actions/meet.ts [app-rsc] (ecmascript)\" } [app-rsc] (server actions loader, ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "0026cf27b9519f8337b7093d9260e4f1d242ddf8a5",
    ()=>__TURBOPACK__imported__module__$5b$project$5d2f$darion$2d$chat$2f$src$2f$app$2f$actions$2f$messages$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["getConversationsListAction"],
    "0087fd72aeda3b5135a300facaa73973f18db18f57",
    ()=>__TURBOPACK__imported__module__$5b$project$5d2f$darion$2d$chat$2f$src$2f$app$2f$actions$2f$messages$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["getUnreadMessagesCountAction"],
    "4003f015091238bcd00be8e8bb3700aeb23073a5d6",
    ()=>__TURBOPACK__imported__module__$5b$project$5d2f$darion$2d$chat$2f$src$2f$app$2f$actions$2f$messages$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["deleteMessageAction"],
    "40089b13a5cc7e75ea918267a4d1d14bdec1118c65",
    ()=>__TURBOPACK__imported__module__$5b$project$5d2f$darion$2d$chat$2f$src$2f$app$2f$actions$2f$messages$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["createChannelAction"],
    "4017178f4d1c77e5f1e06fffd2f79b6b5053b286e8",
    ()=>__TURBOPACK__imported__module__$5b$project$5d2f$darion$2d$chat$2f$src$2f$app$2f$actions$2f$messages$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["sendMessageAction"],
    "402a2d43a614e4c9a7e7ea6137801b422205a4ea8a",
    ()=>__TURBOPACK__imported__module__$5b$project$5d2f$darion$2d$chat$2f$src$2f$app$2f$actions$2f$calls$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["initiateCallAction"],
    "402c35a0b4cd9b7078e08a0a70ea09a750c3aff865",
    ()=>__TURBOPACK__imported__module__$5b$project$5d2f$darion$2d$chat$2f$src$2f$app$2f$actions$2f$messages$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["uploadChatAttachmentAction"],
    "404c684b8a2e6cd8e7a0ff6425370f0ca6d6ea4cb3",
    ()=>__TURBOPACK__imported__module__$5b$project$5d2f$darion$2d$chat$2f$src$2f$app$2f$actions$2f$messages$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["markConversationAsReadAction"],
    "4076631d0e2fe1430e2df2fa553c3b5a804ab4638a",
    ()=>__TURBOPACK__imported__module__$5b$project$5d2f$darion$2d$chat$2f$src$2f$app$2f$actions$2f$messages$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["createDirectMessageAction"],
    "40a1dca22df4c709fb651c525b88a983bfb2400fe5",
    ()=>__TURBOPACK__imported__module__$5b$project$5d2f$darion$2d$chat$2f$src$2f$app$2f$actions$2f$messages$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["forwardMessageAction"],
    "40d7ab5efa5e7849328a8aab0cb6dc14462f01879e",
    ()=>__TURBOPACK__imported__module__$5b$project$5d2f$darion$2d$chat$2f$src$2f$app$2f$actions$2f$calls$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["respondToCallAction"],
    "40fc57de8ae7de18e7e144a5c07ddbdb9da5320239",
    ()=>__TURBOPACK__imported__module__$5b$project$5d2f$darion$2d$chat$2f$src$2f$app$2f$actions$2f$messages$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["getUserDirectoryAction"],
    "603bf8de8f804685825ff117c0b3ad60fd131e6496",
    ()=>__TURBOPACK__imported__module__$5b$project$5d2f$darion$2d$chat$2f$src$2f$app$2f$actions$2f$calls$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["updateCallStatusAction"],
    "6093c5f335e765ba5b6e0c710b2e2f204d2dcf3657",
    ()=>__TURBOPACK__imported__module__$5b$project$5d2f$darion$2d$chat$2f$src$2f$app$2f$actions$2f$messages$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["toggleReactionAction"],
    "60b0d022ae5ad8984c24004189b01296aa666a2456",
    ()=>__TURBOPACK__imported__module__$5b$project$5d2f$darion$2d$chat$2f$src$2f$app$2f$actions$2f$messages$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["startInstantMeetInChatAction"],
    "60ce227253d3d6e37c786950b046b72f6a939fd768",
    ()=>__TURBOPACK__imported__module__$5b$project$5d2f$darion$2d$chat$2f$src$2f$app$2f$actions$2f$messages$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["getConversationMessagesAction"],
    "60d0e338caac30e5d0e61dbfd8006071fe8a3cef10",
    ()=>__TURBOPACK__imported__module__$5b$project$5d2f$darion$2d$chat$2f$src$2f$app$2f$actions$2f$messages$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["editMessageAction"],
    "60d991f714debd4d08b7b6085bfa4b3efc936ef235",
    ()=>__TURBOPACK__imported__module__$5b$project$5d2f$darion$2d$chat$2f$src$2f$app$2f$actions$2f$messages$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["setUserPresenceAction"],
    "706480f7847a1b6f7bc1cf2ae2985f942afa6f2fee",
    ()=>__TURBOPACK__imported__module__$5b$project$5d2f$darion$2d$chat$2f$src$2f$app$2f$actions$2f$meet$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["createInstantMeetingAction"]
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$darion$2d$chat$2f2e$next$2d$internal$2f$server$2f$app$2f$page$2f$actions$2e$js__$7b$__ACTIONS_MODULE0__$3d3e$__$225b$project$5d2f$darion$2d$chat$2f$src$2f$app$2f$actions$2f$calls$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29222c$__ACTIONS_MODULE1__$3d3e$__$225b$project$5d2f$darion$2d$chat$2f$src$2f$app$2f$actions$2f$messages$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29222c$__ACTIONS_MODULE2__$3d3e$__$225b$project$5d2f$darion$2d$chat$2f$src$2f$app$2f$actions$2f$meet$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$2922$__$7d$__$5b$app$2d$rsc$5d$__$28$server__actions__loader$2c$__ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i('[project]/darion-chat/.next-internal/server/app/page/actions.js { ACTIONS_MODULE0 => "[project]/darion-chat/src/app/actions/calls.ts [app-rsc] (ecmascript)", ACTIONS_MODULE1 => "[project]/darion-chat/src/app/actions/messages.ts [app-rsc] (ecmascript)", ACTIONS_MODULE2 => "[project]/darion-chat/src/app/actions/meet.ts [app-rsc] (ecmascript)" } [app-rsc] (server actions loader, ecmascript) <locals>');
var __TURBOPACK__imported__module__$5b$project$5d2f$darion$2d$chat$2f$src$2f$app$2f$actions$2f$calls$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/darion-chat/src/app/actions/calls.ts [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$darion$2d$chat$2f$src$2f$app$2f$actions$2f$messages$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/darion-chat/src/app/actions/messages.ts [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$darion$2d$chat$2f$src$2f$app$2f$actions$2f$meet$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/darion-chat/src/app/actions/meet.ts [app-rsc] (ecmascript)");
}),
"[project]/darion-chat/.next-internal/server/app/page/actions.js { ACTIONS_MODULE0 => \"[project]/darion-chat/src/app/actions/calls.ts [app-rsc] (ecmascript)\", ACTIONS_MODULE1 => \"[project]/darion-chat/src/app/actions/messages.ts [app-rsc] (ecmascript)\", ACTIONS_MODULE2 => \"[project]/darion-chat/src/app/actions/meet.ts [app-rsc] (ecmascript)\" } [app-rsc] (server actions loader, ecmascript) <locals>", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([]);
var __TURBOPACK__imported__module__$5b$project$5d2f$darion$2d$chat$2f$src$2f$app$2f$actions$2f$calls$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/darion-chat/src/app/actions/calls.ts [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$darion$2d$chat$2f$src$2f$app$2f$actions$2f$messages$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/darion-chat/src/app/actions/messages.ts [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$darion$2d$chat$2f$src$2f$app$2f$actions$2f$meet$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/darion-chat/src/app/actions/meet.ts [app-rsc] (ecmascript)");
;
;
;
;
;
;
;
;
;
;
;
;
;
;
;
;
;
;
;
;
;
;
;
;
;
;
;
;
;
;
;
}),
"[project]/darion-chat/src/app/actions/calls.ts [app-rsc] (ecmascript)", ((__turbopack_context__) => {
"use strict";

/* __next_internal_action_entry_do_not_use__ [{"402a2d43a614e4c9a7e7ea6137801b422205a4ea8a":{"name":"initiateCallAction"},"40d7ab5efa5e7849328a8aab0cb6dc14462f01879e":{"name":"respondToCallAction"},"603bf8de8f804685825ff117c0b3ad60fd131e6496":{"name":"updateCallStatusAction"}},"darion-chat/src/app/actions/calls.ts",""] */ __turbopack_context__.s([
    "initiateCallAction",
    ()=>initiateCallAction,
    "respondToCallAction",
    ()=>respondToCallAction,
    "updateCallStatusAction",
    ()=>updateCallStatusAction
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$build$2f$webpack$2f$loaders$2f$next$2d$flight$2d$loader$2f$server$2d$reference$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/build/webpack/loaders/next-flight-loader/server-reference.js [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$darion$2d$chat$2f$src$2f$lib$2f$supabase$2f$server$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/darion-chat/src/lib/supabase/server.ts [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$darion$2d$chat$2f$src$2f$lib$2f$utils$2f$notifications$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/darion-chat/src/lib/utils/notifications.ts [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$cache$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/cache.js [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$build$2f$webpack$2f$loaders$2f$next$2d$flight$2d$loader$2f$action$2d$validate$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/build/webpack/loaders/next-flight-loader/action-validate.js [app-rsc] (ecmascript)");
;
;
;
;
async function getSupabase() {
    return await (0, __TURBOPACK__imported__module__$5b$project$5d2f$darion$2d$chat$2f$src$2f$lib$2f$supabase$2f$server$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["createClient"])();
}
async function initiateCallAction(params) {
    try {
        const user = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$darion$2d$chat$2f$src$2f$lib$2f$supabase$2f$server$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["getCurrentUserFast"])();
        if (!user) throw new Error('Unauthorized');
        const supabase = await getSupabase();
        const adminClient = (0, __TURBOPACK__imported__module__$5b$project$5d2f$darion$2d$chat$2f$src$2f$lib$2f$supabase$2f$server$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["createAdminClient"])();
        const callType = params.callType || 'video';
        // 1. Fetch caller profile details
        const { data: profile } = await supabase.from('profiles').select('full_name, avatar_url, role').eq('id', user.id).single();
        const callerName = profile?.full_name || 'Team Member';
        const callerAvatar = profile?.avatar_url || '';
        const callerRole = profile?.role || 'member';
        // 2. Generate room code and create meet room in meet_rooms table
        const randomSuffix = Math.floor(1000 + Math.random() * 9000);
        const roomCode = `dar-${callType}-${randomSuffix}`;
        const callTitle = params.title || `Call with ${callerName}`;
        const { data: room, error: roomError } = await adminClient.from('meet_rooms').insert({
            title: callTitle,
            room_code: roomCode,
            host_id: user.id,
            status: 'active',
            started_at: new Date().toISOString(),
            waiting_room_enabled: false,
            allow_screen_share: true,
            allow_chat: true,
            allow_unmute: true
        }).select().single();
        if (roomError || !room) {
            console.error('Error creating call room:', roomError);
            throw new Error('Failed to create call room');
        }
        let effectiveConvId = params.conversationId;
        let conversationName = 'Direct Chat';
        if (effectiveConvId.startsWith('default-')) {
            const slug = effectiveConvId.replace('default-', '');
            const { data: existingChannel } = await adminClient.from('chat_conversations').select('id, name').eq('slug', slug).maybeSingle();
            if (existingChannel) {
                effectiveConvId = existingChannel.id;
                conversationName = existingChannel.name;
            }
        } else {
            const { data: convData } = await adminClient.from('chat_conversations').select('name').eq('id', effectiveConvId).maybeSingle();
            if (convData?.name) conversationName = convData.name;
        }
        // 3. Resolve recipient users STRICTLY (Only target users in this conversation)
        let recipientIds = [];
        if (params.targetUserId && params.targetUserId !== user.id) {
            recipientIds = [
                params.targetUserId
            ];
        } else {
            const { data: participants } = await adminClient.from('chat_participants').select('user_id').eq('conversation_id', effectiveConvId).neq('user_id', user.id);
            if (participants && participants.length > 0) {
                recipientIds = participants.map((p)=>p.user_id);
            }
        }
        // 4. Insert interactive call card into conversation message feed (initial status: calling)
        await adminClient.from('chat_messages').insert({
            conversation_id: effectiveConvId,
            sender_id: user.id,
            message_type: 'meet_card',
            content: `calling... (${callType})`,
            metadata: {
                roomId: room.id,
                roomCode: room.room_code,
                title: callTitle,
                hostName: callerName,
                callerId: user.id,
                callType,
                status: 'calling',
                recipientIds,
                startedAt: room.started_at,
                meetUrl: `/meet/${room.room_code}`
            }
        });
        const callPayload = {
            callId: room.id,
            roomCode: room.room_code,
            callerId: user.id,
            callerName,
            callerAvatar,
            callerRole,
            conversationId: effectiveConvId,
            conversationName,
            callType,
            recipientIds,
            meetUrl: `/meet/${room.room_code}`,
            startedAt: room.started_at
        };
        // 5. Send ringing notification ONLY to resolved recipient IDs
        if (recipientIds.length > 0) {
            const notifications = recipientIds.map((uid)=>({
                    userId: uid,
                    type: 'meet_started',
                    title: `📞 Incoming ${callType.toUpperCase()} Call: ${callerName}`,
                    message: `${callerName} is calling you for "${callTitle}". Click to answer.`,
                    link: `/meet/${room.room_code}`,
                    metadata: {
                        callerId: user.id,
                        callerName,
                        callerAvatar,
                        callerRole,
                        conversationId: effectiveConvId,
                        roomCode: room.room_code,
                        recipientIds
                    }
                }));
            await (0, __TURBOPACK__imported__module__$5b$project$5d2f$darion$2d$chat$2f$src$2f$lib$2f$utils$2f$notifications$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["sendBulkNotification"])(notifications);
        }
        (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$cache$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["revalidatePath"])('/admin/messages');
        (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$cache$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["revalidatePath"])('/candidate/messages');
        return {
            success: true,
            callPayload
        };
    } catch (err) {
        return {
            success: false,
            error: err.message || 'Failed to start call'
        };
    }
}
async function respondToCallAction(params) {
    try {
        const user = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$darion$2d$chat$2f$src$2f$lib$2f$supabase$2f$server$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["getCurrentUserFast"])();
        if (!user) throw new Error('Unauthorized');
        const adminClient = (0, __TURBOPACK__imported__module__$5b$project$5d2f$darion$2d$chat$2f$src$2f$lib$2f$supabase$2f$server$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["createAdminClient"])();
        // 1. Update matching chat_messages status based on call outcome using adminClient (bypasses RLS)
        const { data: msgs } = await adminClient.from('chat_messages').select('id, metadata').filter('metadata->>roomCode', 'eq', params.roomCode);
        if (msgs && msgs.length > 0) {
            for (const m of msgs){
                const prevMeta = m.metadata || {};
                let updatedContent = 'connected live call';
                let updatedStatus = 'connected';
                if (params.response === 'accept') {
                    updatedContent = `started a live ${prevMeta.callType || 'video'} meeting`;
                    updatedStatus = 'connected';
                } else if (params.response === 'decline') {
                    updatedContent = `declined ${prevMeta.callType || 'video'} call`;
                    updatedStatus = 'declined';
                } else if (params.response === 'missed') {
                    updatedContent = `missed ${prevMeta.callType || 'video'} call`;
                    updatedStatus = 'missed';
                } else if (params.response === 'cancelled') {
                    updatedContent = `cancelled ${prevMeta.callType || 'video'} call`;
                    updatedStatus = 'cancelled';
                }
                await adminClient.from('chat_messages').update({
                    content: updatedContent,
                    metadata: {
                        ...prevMeta,
                        status: updatedStatus,
                        endedAt: new Date().toISOString()
                    }
                }).eq('id', m.id);
            }
        }
        if (params.response === 'accept') {
            (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$cache$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["revalidatePath"])('/admin/messages');
            (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$cache$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["revalidatePath"])('/candidate/messages');
            return {
                success: true,
                meetUrl: `/meet/${params.roomCode}`
            };
        }
        if (params.response === 'decline' && params.callerId) {
            await (0, __TURBOPACK__imported__module__$5b$project$5d2f$darion$2d$chat$2f$src$2f$lib$2f$utils$2f$notifications$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["sendNotification"])({
                userId: params.callerId,
                type: 'chat_message',
                title: 'Call Declined',
                message: 'The recipient is currently unavailable.'
            });
        }
        if (params.response === 'missed') {
            let callerName = 'a teammate';
            if (params.callerId) {
                const { data: profile } = await adminClient.from('profiles').select('full_name').eq('id', params.callerId).single();
                if (profile?.full_name) callerName = profile.full_name;
            }
            await (0, __TURBOPACK__imported__module__$5b$project$5d2f$darion$2d$chat$2f$src$2f$lib$2f$utils$2f$notifications$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["sendNotification"])({
                userId: user.id,
                type: 'chat_message',
                title: 'Missed Call',
                message: `You missed a call from ${callerName}.`
            });
        }
        (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$cache$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["revalidatePath"])('/admin/messages');
        (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$cache$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["revalidatePath"])('/candidate/messages');
        return {
            success: true
        };
    } catch (err) {
        return {
            success: false,
            error: err.message
        };
    }
}
async function updateCallStatusAction(roomCode, status) {
    try {
        const adminClient = (0, __TURBOPACK__imported__module__$5b$project$5d2f$darion$2d$chat$2f$src$2f$lib$2f$supabase$2f$server$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["createAdminClient"])();
        const { data: msgs } = await adminClient.from('chat_messages').select('id, metadata').filter('metadata->>roomCode', 'eq', roomCode);
        if (msgs && msgs.length > 0) {
            for (const m of msgs){
                const prevMeta = m.metadata || {};
                if (prevMeta.status !== 'connected' && prevMeta.status !== 'declined' && prevMeta.status !== 'missed' && prevMeta.status !== 'cancelled') {
                    await adminClient.from('chat_messages').update({
                        content: `${status}... (${prevMeta.callType || 'video'})`,
                        metadata: {
                            ...prevMeta,
                            status
                        }
                    }).eq('id', m.id);
                }
            }
        }
        return {
            success: true
        };
    } catch  {
        return {
            success: false
        };
    }
}
;
(0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$build$2f$webpack$2f$loaders$2f$next$2d$flight$2d$loader$2f$action$2d$validate$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["ensureServerEntryExports"])([
    initiateCallAction,
    respondToCallAction,
    updateCallStatusAction
]);
(0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$build$2f$webpack$2f$loaders$2f$next$2d$flight$2d$loader$2f$server$2d$reference$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["registerServerReference"])(initiateCallAction, "402a2d43a614e4c9a7e7ea6137801b422205a4ea8a", null);
(0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$build$2f$webpack$2f$loaders$2f$next$2d$flight$2d$loader$2f$server$2d$reference$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["registerServerReference"])(respondToCallAction, "40d7ab5efa5e7849328a8aab0cb6dc14462f01879e", null);
(0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$build$2f$webpack$2f$loaders$2f$next$2d$flight$2d$loader$2f$server$2d$reference$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["registerServerReference"])(updateCallStatusAction, "603bf8de8f804685825ff117c0b3ad60fd131e6496", null);
}),
"[project]/darion-chat/src/app/actions/meet.ts [app-rsc] (ecmascript)", ((__turbopack_context__) => {
"use strict";

/* __next_internal_action_entry_do_not_use__ [{"0061d29f197b02697e0d1b8c4d5c680352b51ae81d":{"name":"getPastMeetingsWithRecordings"},"00ececfe73d0daa077e8291e199daceaa09e598eea":{"name":"getUpcomingMeetings"},"401dbe91debca641c92a3b69ee084ba4a4ce571191":{"name":"deleteMeetingAction"},"401e0b117f38fc59c4dd2160c214cf1b69a1892d47":{"name":"uploadMeetingRecordingAction"},"403f05c422242db210659a8e560830b5d79b206d17":{"name":"getMeetingByCodeOrId"},"40428ce56c10940904cc3b00a15306de1831615b48":{"name":"endMeetingAction"},"409519d27678958e145a897987845582557d6d993c":{"name":"scheduleMeetingAction"},"706480f7847a1b6f7bc1cf2ae2985f942afa6f2fee":{"name":"createInstantMeetingAction"}},"darion-chat/src/app/actions/meet.ts",""] */ __turbopack_context__.s([
    "createInstantMeetingAction",
    ()=>createInstantMeetingAction,
    "deleteMeetingAction",
    ()=>deleteMeetingAction,
    "endMeetingAction",
    ()=>endMeetingAction,
    "getMeetingByCodeOrId",
    ()=>getMeetingByCodeOrId,
    "getPastMeetingsWithRecordings",
    ()=>getPastMeetingsWithRecordings,
    "getUpcomingMeetings",
    ()=>getUpcomingMeetings,
    "scheduleMeetingAction",
    ()=>scheduleMeetingAction,
    "uploadMeetingRecordingAction",
    ()=>uploadMeetingRecordingAction
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$build$2f$webpack$2f$loaders$2f$next$2d$flight$2d$loader$2f$server$2d$reference$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/build/webpack/loaders/next-flight-loader/server-reference.js [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$darion$2d$chat$2f$src$2f$lib$2f$supabase$2f$server$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/darion-chat/src/lib/supabase/server.ts [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$cache$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/cache.js [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$darion$2d$chat$2f$src$2f$lib$2f$meet$2f$googleDrive$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/darion-chat/src/lib/meet/googleDrive.ts [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$build$2f$webpack$2f$loaders$2f$next$2d$flight$2d$loader$2f$action$2d$validate$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/build/webpack/loaders/next-flight-loader/action-validate.js [app-rsc] (ecmascript)");
;
;
;
// Helper to get supabase client with admin fallback
function getSupabase() {
    try {
        return (0, __TURBOPACK__imported__module__$5b$project$5d2f$darion$2d$chat$2f$src$2f$lib$2f$supabase$2f$server$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["createAdminClient"])();
    } catch  {
        return (0, __TURBOPACK__imported__module__$5b$project$5d2f$darion$2d$chat$2f$src$2f$lib$2f$supabase$2f$server$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["createClient"])();
    }
}
// Helper to validate UUID format
function sanitizeUuid(id) {
    if (!id) return null;
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    return uuidRegex.test(id) ? id : null;
}
// Helper to generate readable meeting codes e.g. "dar-meet-7392"
function generateRoomCode() {
    const chars = 'abcdefghijklmnopqrstuvwxyz0123456789';
    const part1 = Array.from({
        length: 3
    }, ()=>chars[Math.floor(Math.random() * chars.length)]).join('');
    const part2 = Array.from({
        length: 4
    }, ()=>chars[Math.floor(Math.random() * chars.length)]).join('');
    const part3 = Array.from({
        length: 3
    }, ()=>chars[Math.floor(Math.random() * chars.length)]).join('');
    return `${part1}-${part2}-${part3}`;
}
async function createInstantMeetingAction(hostName = 'Host', hostId, title = 'Instant Meeting') {
    const supabase = await getSupabase();
    const roomCode = generateRoomCode();
    const validHostId = sanitizeUuid(hostId);
    const { data, error } = await supabase.from('meet_rooms').insert({
        room_code: roomCode,
        title: title || 'Instant Meeting',
        host_name: hostName || 'Host',
        host_id: validHostId,
        status: 'active',
        started_at: new Date().toISOString(),
        waiting_room_enabled: false,
        allow_screen_share: true,
        allow_chat: true,
        allow_unmute: true
    }).select().single();
    if (error) {
        console.error('Error creating instant meeting:', error);
        throw new Error(error.message || 'Failed to create instant meeting');
    }
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$cache$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["revalidatePath"])('/admin/meets');
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$cache$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["revalidatePath"])('/candidate/meets');
    return {
        roomId: data.id,
        roomCode: data.room_code
    };
}
async function scheduleMeetingAction(formData) {
    const supabase = await getSupabase();
    const title = formData.get('title') || 'Scheduled Meeting';
    const description = formData.get('description') || '';
    const scheduledStartAt = formData.get('scheduled_start_at');
    const scheduledEndAt = formData.get('scheduled_end_at');
    const hostName = formData.get('host_name') || 'Host';
    const rawHostId = formData.get('host_id');
    const validHostId = sanitizeUuid(rawHostId);
    const waitingRoom = formData.get('waiting_room_enabled') === 'true';
    const roomCode = generateRoomCode();
    const { data, error } = await supabase.from('meet_rooms').insert({
        room_code: roomCode,
        title,
        description,
        host_name: hostName,
        host_id: validHostId,
        status: 'scheduled',
        scheduled_start_at: scheduledStartAt ? new Date(scheduledStartAt).toISOString() : null,
        scheduled_end_at: scheduledEndAt ? new Date(scheduledEndAt).toISOString() : null,
        waiting_room_enabled: waitingRoom,
        allow_screen_share: true,
        allow_chat: true,
        allow_unmute: true
    }).select().single();
    if (error) {
        console.error('Error scheduling meeting:', error);
        return {
            success: false,
            error: error.message
        };
    }
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$cache$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["revalidatePath"])('/admin/meets');
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$cache$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["revalidatePath"])('/candidate/meets');
    return {
        success: true,
        room: data
    };
}
async function getMeetingByCodeOrId(identifier) {
    const supabase = await getSupabase();
    // Try matching room_code first, then UUID id
    let query = supabase.from('meet_rooms').select('*, meet_recordings(*)').eq('room_code', identifier);
    let { data, error } = await query.maybeSingle();
    if (!data && sanitizeUuid(identifier)) {
        const uuidQuery = supabase.from('meet_rooms').select('*, meet_recordings(*)').eq('id', identifier);
        const result = await uuidQuery.maybeSingle();
        data = result.data;
        error = result.error;
    }
    if (error || !data) {
        return null;
    }
    return data;
}
async function getUpcomingMeetings() {
    const supabase = await getSupabase();
    const { data, error } = await supabase.from('meet_rooms').select('*').in('status', [
        'active',
        'scheduled'
    ]).order('created_at', {
        ascending: false
    });
    if (error) {
        console.error('Error fetching upcoming meetings:', error);
        return [];
    }
    return data;
}
async function getPastMeetingsWithRecordings() {
    const supabase = await getSupabase();
    const { data, error } = await supabase.from('meet_rooms').select('*, meet_recordings(*), meet_participants(count)').order('created_at', {
        ascending: false
    }).limit(25);
    if (error) {
        console.error('Error fetching past meetings:', error);
        return [];
    }
    return data;
}
async function deleteMeetingAction(roomId) {
    const supabase = await getSupabase();
    const { error } = await supabase.from('meet_rooms').delete().eq('id', roomId);
    if (error) {
        console.error('Error deleting meeting:', error);
        return {
            success: false,
            error: error.message
        };
    }
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$cache$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["revalidatePath"])('/admin/meets');
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$cache$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["revalidatePath"])('/candidate/meets');
    return {
        success: true
    };
}
;
async function endMeetingAction(roomId) {
    const supabase = await getSupabase();
    const validId = sanitizeUuid(roomId);
    let query = supabase.from('meet_rooms').update({
        status: 'ended',
        ended_at: new Date().toISOString()
    });
    if (validId) {
        query = query.eq('id', validId);
    } else {
        query = query.eq('room_code', roomId);
    }
    const { error } = await query;
    if (error) {
        console.error('Error ending meeting in DB:', error);
        return {
            success: false,
            error: error.message
        };
    }
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$cache$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["revalidatePath"])('/admin/meets');
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$cache$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["revalidatePath"])('/candidate/meets');
    return {
        success: true
    };
}
async function uploadMeetingRecordingAction(formData) {
    const supabase = await getSupabase();
    const file = formData.get('file');
    const roomId = formData.get('room_id');
    const roomTitle = formData.get('room_title') || 'Meeting';
    const recordedByName = formData.get('recorded_by_name') || 'Host';
    const durationSeconds = parseInt(formData.get('duration_seconds') || '0', 10);
    if (!file || !roomId) {
        return {
            success: false,
            error: 'Missing file or room ID'
        };
    }
    try {
        const arrayBuffer = await file.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);
        const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
        const storagePath = `${roomId}/${timestamp}_recording.webm`;
        // 1. Upload to Supabase Storage
        const { data: storageData, error: storageErr } = await supabase.storage.from('meet-recordings').upload(storagePath, buffer, {
            contentType: file.type || 'video/webm',
            upsert: true
        });
        let publicUrl = '';
        if (!storageErr && storageData) {
            const { data: urlData } = supabase.storage.from('meet-recordings').getPublicUrl(storageData.path);
            publicUrl = urlData.publicUrl;
        }
        // 2. Upload to Google Drive
        const gdriveRes = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$darion$2d$chat$2f$src$2f$lib$2f$meet$2f$googleDrive$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["uploadBufferToGoogleDrive"])({
            buffer,
            fileName: `${roomTitle.replace(/[^a-zA-Z0-9_-]/g, '_')}_${timestamp}.webm`,
            mimeType: file.type || 'video/webm'
        });
        // 3. Look up valid room UUID
        let actualRoomId = sanitizeUuid(roomId);
        if (!actualRoomId) {
            const { data: roomRecord } = await supabase.from('meet_rooms').select('id').eq('room_code', roomId).maybeSingle();
            actualRoomId = roomRecord?.id || null;
        }
        if (actualRoomId) {
            // 4. Save record to meet_recordings
            const { error: insertErr } = await supabase.from('meet_recordings').insert({
                room_id: actualRoomId,
                file_url: publicUrl || gdriveRes.webViewLink || '',
                duration_seconds: durationSeconds,
                file_size_bytes: buffer.length,
                recorded_by_name: recordedByName,
                google_drive_file_id: gdriveRes.fileId || null,
                google_drive_url: gdriveRes.webViewLink || null,
                google_drive_status: gdriveRes.success ? 'uploaded' : 'not_configured'
            });
            if (insertErr) {
                console.error('Database Insert Error:', insertErr);
                throw new Error('Failed to save recording to database: ' + insertErr.message);
            }
        }
        (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$cache$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["revalidatePath"])('/admin/meets');
        (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$cache$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["revalidatePath"])('/candidate/meets');
        return {
            success: true,
            publicUrl,
            googleDriveUrl: gdriveRes.webViewLink || null,
            googleDriveStatus: gdriveRes.success ? 'uploaded' : 'not_configured'
        };
    } catch (err) {
        console.error('Failed to process meeting recording:', err);
        return {
            success: false,
            error: err?.message || 'Upload failed'
        };
    }
}
;
(0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$build$2f$webpack$2f$loaders$2f$next$2d$flight$2d$loader$2f$action$2d$validate$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["ensureServerEntryExports"])([
    createInstantMeetingAction,
    scheduleMeetingAction,
    getMeetingByCodeOrId,
    getUpcomingMeetings,
    getPastMeetingsWithRecordings,
    deleteMeetingAction,
    endMeetingAction,
    uploadMeetingRecordingAction
]);
(0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$build$2f$webpack$2f$loaders$2f$next$2d$flight$2d$loader$2f$server$2d$reference$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["registerServerReference"])(createInstantMeetingAction, "706480f7847a1b6f7bc1cf2ae2985f942afa6f2fee", null);
(0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$build$2f$webpack$2f$loaders$2f$next$2d$flight$2d$loader$2f$server$2d$reference$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["registerServerReference"])(scheduleMeetingAction, "409519d27678958e145a897987845582557d6d993c", null);
(0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$build$2f$webpack$2f$loaders$2f$next$2d$flight$2d$loader$2f$server$2d$reference$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["registerServerReference"])(getMeetingByCodeOrId, "403f05c422242db210659a8e560830b5d79b206d17", null);
(0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$build$2f$webpack$2f$loaders$2f$next$2d$flight$2d$loader$2f$server$2d$reference$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["registerServerReference"])(getUpcomingMeetings, "00ececfe73d0daa077e8291e199daceaa09e598eea", null);
(0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$build$2f$webpack$2f$loaders$2f$next$2d$flight$2d$loader$2f$server$2d$reference$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["registerServerReference"])(getPastMeetingsWithRecordings, "0061d29f197b02697e0d1b8c4d5c680352b51ae81d", null);
(0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$build$2f$webpack$2f$loaders$2f$next$2d$flight$2d$loader$2f$server$2d$reference$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["registerServerReference"])(deleteMeetingAction, "401dbe91debca641c92a3b69ee084ba4a4ce571191", null);
(0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$build$2f$webpack$2f$loaders$2f$next$2d$flight$2d$loader$2f$server$2d$reference$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["registerServerReference"])(endMeetingAction, "40428ce56c10940904cc3b00a15306de1831615b48", null);
(0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$build$2f$webpack$2f$loaders$2f$next$2d$flight$2d$loader$2f$server$2d$reference$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["registerServerReference"])(uploadMeetingRecordingAction, "401e0b117f38fc59c4dd2160c214cf1b69a1892d47", null);
}),
"[project]/darion-chat/src/app/actions/messages.ts [app-rsc] (ecmascript)", ((__turbopack_context__) => {
"use strict";

/* __next_internal_action_entry_do_not_use__ [{"0026cf27b9519f8337b7093d9260e4f1d242ddf8a5":{"name":"getConversationsListAction"},"0087fd72aeda3b5135a300facaa73973f18db18f57":{"name":"getUnreadMessagesCountAction"},"4003f015091238bcd00be8e8bb3700aeb23073a5d6":{"name":"deleteMessageAction"},"40089b13a5cc7e75ea918267a4d1d14bdec1118c65":{"name":"createChannelAction"},"4017178f4d1c77e5f1e06fffd2f79b6b5053b286e8":{"name":"sendMessageAction"},"402c35a0b4cd9b7078e08a0a70ea09a750c3aff865":{"name":"uploadChatAttachmentAction"},"404c684b8a2e6cd8e7a0ff6425370f0ca6d6ea4cb3":{"name":"markConversationAsReadAction"},"4076631d0e2fe1430e2df2fa553c3b5a804ab4638a":{"name":"createDirectMessageAction"},"40a1dca22df4c709fb651c525b88a983bfb2400fe5":{"name":"forwardMessageAction"},"40fc57de8ae7de18e7e144a5c07ddbdb9da5320239":{"name":"getUserDirectoryAction"},"6093c5f335e765ba5b6e0c710b2e2f204d2dcf3657":{"name":"toggleReactionAction"},"60b0d022ae5ad8984c24004189b01296aa666a2456":{"name":"startInstantMeetInChatAction"},"60ce227253d3d6e37c786950b046b72f6a939fd768":{"name":"getConversationMessagesAction"},"60d0e338caac30e5d0e61dbfd8006071fe8a3cef10":{"name":"editMessageAction"},"60d991f714debd4d08b7b6085bfa4b3efc936ef235":{"name":"setUserPresenceAction"}},"darion-chat/src/app/actions/messages.ts",""] */ __turbopack_context__.s([
    "createChannelAction",
    ()=>createChannelAction,
    "createDirectMessageAction",
    ()=>createDirectMessageAction,
    "deleteMessageAction",
    ()=>deleteMessageAction,
    "editMessageAction",
    ()=>editMessageAction,
    "forwardMessageAction",
    ()=>forwardMessageAction,
    "getConversationMessagesAction",
    ()=>getConversationMessagesAction,
    "getConversationsListAction",
    ()=>getConversationsListAction,
    "getUnreadMessagesCountAction",
    ()=>getUnreadMessagesCountAction,
    "getUserDirectoryAction",
    ()=>getUserDirectoryAction,
    "markConversationAsReadAction",
    ()=>markConversationAsReadAction,
    "sendMessageAction",
    ()=>sendMessageAction,
    "setUserPresenceAction",
    ()=>setUserPresenceAction,
    "startInstantMeetInChatAction",
    ()=>startInstantMeetInChatAction,
    "toggleReactionAction",
    ()=>toggleReactionAction,
    "uploadChatAttachmentAction",
    ()=>uploadChatAttachmentAction
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$build$2f$webpack$2f$loaders$2f$next$2d$flight$2d$loader$2f$server$2d$reference$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/build/webpack/loaders/next-flight-loader/server-reference.js [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$darion$2d$chat$2f$src$2f$lib$2f$supabase$2f$server$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/darion-chat/src/lib/supabase/server.ts [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$cache$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/cache.js [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$darion$2d$chat$2f$src$2f$lib$2f$utils$2f$notifications$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/darion-chat/src/lib/utils/notifications.ts [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$build$2f$webpack$2f$loaders$2f$next$2d$flight$2d$loader$2f$action$2d$validate$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/build/webpack/loaders/next-flight-loader/action-validate.js [app-rsc] (ecmascript)");
;
;
;
;
function getSupabase() {
    try {
        return (0, __TURBOPACK__imported__module__$5b$project$5d2f$darion$2d$chat$2f$src$2f$lib$2f$supabase$2f$server$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["createAdminClient"])();
    } catch  {
        return (0, __TURBOPACK__imported__module__$5b$project$5d2f$darion$2d$chat$2f$src$2f$lib$2f$supabase$2f$server$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["createClient"])();
    }
}
function sanitizeUuid(id) {
    if (!id) return null;
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    return uuidRegex.test(id) ? id : null;
}
async function getConversationsListAction() {
    const user = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$darion$2d$chat$2f$src$2f$lib$2f$supabase$2f$server$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["getCurrentUserFast"])();
    if (!user) return [];
    const supabase = await getSupabase();
    // Default fallback channels in case database tables are being provisioned
    const defaultFallbackChannels = [
        {
            id: 'default-general',
            type: 'channel',
            name: 'General',
            slug: 'general',
            description: 'Organization-wide team discussions, general updates, and casual banter.',
            isPrivate: false,
            lastMessageAt: new Date().toISOString(),
            lastMessageSnippet: 'Welcome to the team channel!',
            unreadCount: 0,
            isPinned: true,
            isMuted: false
        },
        {
            id: 'default-announcements',
            type: 'channel',
            name: 'Announcements',
            slug: 'announcements',
            description: 'Official management announcements, policy notices, and company alerts.',
            isPrivate: false,
            lastMessageAt: new Date().toISOString(),
            lastMessageSnippet: 'Important company notices posted here.',
            unreadCount: 0,
            isPinned: false,
            isMuted: false
        },
        {
            id: 'default-shifts',
            type: 'channel',
            name: 'Shift Operations',
            slug: 'shift-operations',
            description: 'Live shift handovers, daily coverage, and attendance queries.',
            isPrivate: false,
            lastMessageAt: new Date().toISOString(),
            lastMessageSnippet: 'Daily shift roster & handovers.',
            unreadCount: 0,
            isPinned: false,
            isMuted: false
        },
        {
            id: 'default-support',
            type: 'channel',
            name: 'HR & Support',
            slug: 'hr-support',
            description: 'Help desk for leave requests, payroll questions, and HR assistance.',
            isPrivate: false,
            lastMessageAt: new Date().toISOString(),
            lastMessageSnippet: 'HR and payroll support channel.',
            unreadCount: 0,
            isPinned: false,
            isMuted: false
        }
    ];
    try {
        // 1. Fetch public channels and conversations where user is a participant
        const { data: userParticipations, error: partError } = await supabase.from('chat_participants').select('conversation_id, last_read_at, is_pinned, is_muted').eq('user_id', user.id);
        if (partError && partError.code === 'PGRST205') {
            return defaultFallbackChannels;
        }
        const userConvIds = (userParticipations || []).map((p)=>p.conversation_id);
        const participationMap = new Map((userParticipations || []).map((p)=>[
                p.conversation_id,
                p
            ]));
        // Fetch all accessible conversations
        let convQuery = supabase.from('chat_conversations').select(`
        id,
        type,
        name,
        slug,
        description,
        avatar_url,
        is_private,
        last_message_at,
        created_at
      `);
        if (userConvIds.length > 0) {
            convQuery = convQuery.or(`is_private.eq.false,id.in.(${userConvIds.join(',')})`);
        } else {
            convQuery = convQuery.eq('is_private', false);
        }
        const { data: convData, error: convError } = await convQuery.order('last_message_at', {
            ascending: false
        });
        if (convError || !convData || convData.length === 0) {
            return defaultFallbackChannels;
        }
        // 2. For each conversation, fetch latest message & unread count & other participant if DM
        const allConvIds = convData.map((c)=>c.id);
        // Fetch all participants for these conversations to resolve DMs
        const { data: allParticipants } = await supabase.from('chat_participants').select(`
      conversation_id,
      user_id,
      profiles (
        id,
        full_name,
        avatar_url,
        role
      )
    `).in('conversation_id', allConvIds);
        // Fetch presence for users
        const { data: presenceList } = await supabase.from('chat_user_presence').select('user_id, status, last_seen_at');
        const presenceMap = new Map((presenceList || []).map((p)=>[
                p.user_id,
                p
            ]));
        // Fetch last messages in bulk
        const { data: lastMessages } = await supabase.from('chat_messages').select(`
      id,
      conversation_id,
      content,
      message_type,
      created_at,
      sender_id,
      profiles:sender_id (full_name)
    `).in('conversation_id', allConvIds).order('created_at', {
            ascending: false
        });
        // Map latest message per conversation
        const lastMessageMap = new Map();
        if (lastMessages) {
            for (const msg of lastMessages){
                if (!lastMessageMap.has(msg.conversation_id)) {
                    lastMessageMap.set(msg.conversation_id, msg);
                }
            }
        }
        const results = convData.map((conv)=>{
            const partInfo = participationMap.get(conv.id);
            const lastReadAt = partInfo?.last_read_at || '1970-01-01T00:00:00.000Z';
            const lastMsg = lastMessageMap.get(conv.id);
            // Check if DM
            let otherParticipant = undefined;
            let displayName = conv.name || (conv.type === 'channel' ? `#${conv.slug}` : 'Group Chat');
            let displayAvatar = conv.avatar_url;
            if (conv.type === 'direct') {
                const convParticipants = (allParticipants || []).filter((p)=>p.conversation_id === conv.id);
                const otherPart = convParticipants.find((p)=>p.user_id !== user.id) || convParticipants[0];
                if (otherPart && otherPart.profiles) {
                    const rawProf = otherPart.profiles;
                    const prof = Array.isArray(rawProf) ? rawProf[0] : rawProf;
                    if (prof) {
                        const pres = presenceMap.get(prof.id);
                        otherParticipant = {
                            userId: prof.id,
                            fullName: prof.full_name || 'Team Member',
                            avatarUrl: prof.avatar_url,
                            role: prof.role || 'candidate',
                            presenceStatus: pres?.status || 'offline',
                            lastSeenAt: pres?.last_seen_at
                        };
                        displayName = otherParticipant.fullName;
                        displayAvatar = otherParticipant.avatarUrl;
                    }
                }
            }
            let lastSnippet = '';
            if (lastMsg) {
                if (lastMsg.message_type === 'meet_card') {
                    lastSnippet = '📹 Video Meeting started';
                } else if (lastMsg.message_type === 'file') {
                    lastSnippet = '📎 Shared an attachment';
                } else {
                    lastSnippet = lastMsg.content;
                }
            }
            // Calculate accurate unread messages count for this conversation
            const convMessages = (lastMessages || []).filter((m)=>m.conversation_id === conv.id);
            const unreadCount = convMessages.filter((m)=>m.sender_id !== user.id && new Date(m.created_at).getTime() > new Date(lastReadAt).getTime()).length;
            return {
                id: conv.id,
                type: conv.type,
                name: displayName,
                slug: conv.slug,
                description: conv.description,
                avatarUrl: displayAvatar,
                isPrivate: conv.is_private,
                lastMessageAt: conv.last_message_at || conv.created_at,
                lastMessageSnippet: lastSnippet,
                lastMessageSenderName: lastMsg?.profiles?.full_name || '',
                unreadCount,
                isPinned: partInfo?.is_pinned || false,
                isMuted: partInfo?.is_muted || false,
                otherParticipant,
                participantsCount: (allParticipants || []).filter((p)=>p.conversation_id === conv.id).length
            };
        });
        // Sort: Pinned first, then by lastMessageAt descending
        return results.sort((a, b)=>{
            if (a.isPinned && !b.isPinned) return -1;
            if (!a.isPinned && b.isPinned) return 1;
            return new Date(b.lastMessageAt).getTime() - new Date(a.lastMessageAt).getTime();
        });
    } catch (err) {
        return defaultFallbackChannels;
    }
}
async function getUnreadMessagesCountAction() {
    const user = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$darion$2d$chat$2f$src$2f$lib$2f$supabase$2f$server$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["getCurrentUserFast"])();
    if (!user) return 0;
    const supabase = await getSupabase();
    try {
        const { data: userParticipations } = await supabase.from('chat_participants').select('conversation_id, last_read_at').eq('user_id', user.id);
        if (!userParticipations || userParticipations.length === 0) return 0;
        let totalUnread = 0;
        for (const p of userParticipations){
            const lastRead = p.last_read_at || '1970-01-01T00:00:00.000Z';
            const { count } = await supabase.from('chat_messages').select('*', {
                count: 'exact',
                head: true
            }).eq('conversation_id', p.conversation_id).neq('sender_id', user.id).gt('created_at', lastRead);
            totalUnread += count || 0;
        }
        return totalUnread;
    } catch  {
        return 0;
    }
}
async function getConversationMessagesAction(conversationId, parentId) {
    const user = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$darion$2d$chat$2f$src$2f$lib$2f$supabase$2f$server$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["getCurrentUserFast"])();
    if (!user) return [];
    // If fallback channel or invalid UUID, return empty
    if (conversationId.startsWith('default-') || !sanitizeUuid(conversationId)) {
        return [];
    }
    try {
        const supabase = await getSupabase();
        let query = supabase.from('chat_messages').select(`
        id,
        conversation_id,
        sender_id,
        parent_id,
        content,
        message_type,
        file_url,
        file_name,
        file_size_bytes,
        file_type,
        metadata,
        is_edited,
        is_pinned,
        created_at,
        updated_at,
        profiles:sender_id (
          id,
          full_name,
          avatar_url,
          role
        )
      `).eq('conversation_id', conversationId).is('deleted_at', null).order('created_at', {
            ascending: true
        });
        if (parentId) {
            query = query.eq('parent_id', parentId);
        } else {
            query = query.is('parent_id', null);
        }
        const { data: messages, error } = await query;
        if (error || !messages) {
            return [];
        }
        // Fetch reactions for these messages
        const messageIds = messages.map((m)=>m.id);
        let reactionsMap = new Map();
        if (messageIds.length > 0) {
            const { data: reactions } = await supabase.from('chat_reactions').select(`
        id,
        message_id,
        user_id,
        emoji,
        profiles:user_id (full_name)
      `).in('message_id', messageIds);
            if (reactions) {
                for (const r of reactions){
                    if (!reactionsMap.has(r.message_id)) {
                        reactionsMap.set(r.message_id, []);
                    }
                    reactionsMap.get(r.message_id).push(r);
                }
            }
        }
        // Also fetch thread reply counts if parent_id is null
        let replyCountMap = new Map();
        if (!parentId && messageIds.length > 0) {
            const { data: replies } = await supabase.from('chat_messages').select('parent_id').in('parent_id', messageIds).is('deleted_at', null);
            if (replies) {
                for (const rep of replies){
                    if (rep.parent_id) {
                        replyCountMap.set(rep.parent_id, (replyCountMap.get(rep.parent_id) || 0) + 1);
                    }
                }
            }
        }
        // Fetch other participants' last_read_at to determine Seen status
        const { data: otherParticipants } = await supabase.from('chat_participants').select(`
      user_id,
      last_read_at,
      profiles:user_id (
        id,
        full_name,
        avatar_url
      )
    `).eq('conversation_id', conversationId).neq('user_id', user.id);
        return messages.map((m)=>{
            const rawReactions = reactionsMap.get(m.id) || [];
            const emojiMap = new Map();
            for (const r of rawReactions){
                if (!emojiMap.has(r.emoji)) {
                    emojiMap.set(r.emoji, {
                        count: 0,
                        hasReacted: false,
                        userNames: []
                    });
                }
                const item = emojiMap.get(r.emoji);
                item.count += 1;
                if (r.user_id === user.id) item.hasReacted = true;
                const name = r.profiles?.full_name || 'User';
                item.userNames.push(name);
            }
            const reactions = Array.from(emojiMap.entries()).map(([emoji, val])=>({
                    emoji,
                    count: val.count,
                    hasReacted: val.hasReacted,
                    userNames: val.userNames
                }));
            const sender = m.profiles;
            const isMe = m.sender_id === user.id;
            let readStatus = 'sent';
            const readByUsers = [];
            if (isMe) {
                const msgTime = new Date(m.created_at).getTime();
                if (otherParticipants && otherParticipants.length > 0) {
                    for (const p of otherParticipants){
                        if (p.last_read_at && new Date(p.last_read_at).getTime() >= msgTime) {
                            const rawProf = p.profiles;
                            const prof = Array.isArray(rawProf) ? rawProf[0] : rawProf;
                            readByUsers.push({
                                userId: p.user_id,
                                fullName: prof?.full_name || 'Team Member',
                                avatarUrl: prof?.avatar_url,
                                readAt: p.last_read_at
                            });
                        }
                    }
                    if (readByUsers.length > 0) {
                        readStatus = 'seen';
                    } else {
                        readStatus = 'delivered';
                    }
                } else {
                    readStatus = 'delivered';
                }
            }
            return {
                id: m.id,
                conversationId: m.conversation_id,
                senderId: m.sender_id,
                senderName: sender?.full_name || 'System User',
                senderAvatarUrl: sender?.avatar_url,
                senderRole: sender?.role || 'candidate',
                parentId: m.parent_id,
                content: m.content,
                messageType: m.message_type,
                fileUrl: m.file_url,
                fileName: m.file_name,
                fileSizeBytes: m.file_size_bytes,
                fileType: m.file_type,
                metadata: m.metadata,
                isEdited: m.is_edited,
                isPinned: m.is_pinned,
                status: readStatus,
                readBy: readByUsers,
                replyTo: m.metadata?.replyTo,
                replyCount: replyCountMap.get(m.id) || 0,
                reactions,
                createdAt: m.created_at,
                updatedAt: m.updated_at
            };
        });
    } catch (err) {
        return [];
    }
}
async function sendMessageAction(payload) {
    const user = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$darion$2d$chat$2f$src$2f$lib$2f$supabase$2f$server$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["getCurrentUserFast"])();
    if (!user) throw new Error('Unauthorized');
    const supabase = await getSupabase();
    let effectiveConvId = payload.conversationId;
    // Auto-resolve fallback channels e.g. default-general to real database channel
    if (effectiveConvId.startsWith('default-')) {
        const slug = effectiveConvId.replace('default-', '');
        const { data: existingChannel } = await supabase.from('chat_conversations').select('id').eq('slug', slug).maybeSingle();
        if (existingChannel) {
            effectiveConvId = existingChannel.id;
        } else {
            const channelNames = {
                general: 'General',
                announcements: 'Announcements',
                'shift-operations': 'Shift Operations',
                'hr-support': 'HR & Support'
            };
            const { data: createdChannel } = await supabase.from('chat_conversations').insert({
                type: 'channel',
                name: channelNames[slug] || slug,
                slug,
                is_private: false,
                created_by: user.id
            }).select('id').maybeSingle();
            if (createdChannel) {
                effectiveConvId = createdChannel.id;
            }
        }
    }
    // Ensure current user is in participants
    await supabase.from('chat_participants').upsert({
        conversation_id: effectiveConvId,
        user_id: user.id,
        last_read_at: new Date().toISOString()
    }, {
        onConflict: 'conversation_id,user_id'
    });
    const { data: newMsg, error } = await supabase.from('chat_messages').insert({
        conversation_id: effectiveConvId,
        sender_id: user.id,
        parent_id: payload.parentId || null,
        content: payload.content || (payload.messageType === 'file' ? `Uploaded ${payload.fileName}` : ''),
        message_type: payload.messageType || 'text',
        file_url: payload.fileUrl,
        file_name: payload.fileName,
        file_size_bytes: payload.fileSizeBytes,
        file_type: payload.fileType,
        metadata: payload.metadata || {}
    }).select(`
      id,
      conversation_id,
      sender_id,
      parent_id,
      content,
      message_type,
      file_url,
      file_name,
      file_size_bytes,
      file_type,
      metadata,
      is_edited,
      is_pinned,
      created_at,
      updated_at,
      profiles:sender_id (
        id,
        full_name,
        avatar_url,
        role
      )
    `).single();
    if (error) {
        console.error('Error sending message:', error);
        throw new Error(error.message || 'Failed to send message');
    }
    // Update conversation last_message_at
    await supabase.from('chat_conversations').update({
        last_message_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
    }).eq('id', payload.conversationId);
    // Dispatch push notifications to other participants
    try {
        const { data: participants } = await supabase.from('chat_participants').select('user_id').eq('conversation_id', effectiveConvId).neq('user_id', user.id);
    // Chat messages are delivered real-time via WebSockets and toast alerts without polluting persistent notifications table
    } catch (notifErr) {
        console.error('Error handling chat dispatch:', notifErr);
    }
    // Revalidate paths
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$cache$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["revalidatePath"])('/admin/messages');
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$cache$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["revalidatePath"])('/candidate/messages');
    return newMsg;
}
async function toggleReactionAction(messageId, emoji) {
    const user = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$darion$2d$chat$2f$src$2f$lib$2f$supabase$2f$server$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["getCurrentUserFast"])();
    if (!user) throw new Error('Unauthorized');
    const supabase = await getSupabase();
    const { data: existing } = await supabase.from('chat_reactions').select('id').eq('message_id', messageId).eq('user_id', user.id).eq('emoji', emoji).maybeSingle();
    if (existing) {
        await supabase.from('chat_reactions').delete().eq('id', existing.id);
        return {
            status: 'removed'
        };
    } else {
        await supabase.from('chat_reactions').insert({
            message_id: messageId,
            user_id: user.id,
            emoji
        });
        return {
            status: 'added'
        };
    }
}
async function editMessageAction(messageId, newContent) {
    const user = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$darion$2d$chat$2f$src$2f$lib$2f$supabase$2f$server$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["getCurrentUserFast"])();
    if (!user) throw new Error('Unauthorized');
    if (!newContent.trim()) {
        return {
            success: false,
            error: 'Message content cannot be empty'
        };
    }
    const supabase = await getSupabase();
    // 1. Check ownership
    const { data: msg, error: fetchErr } = await supabase.from('chat_messages').select('id, sender_id, conversation_id, metadata').eq('id', messageId).single();
    if (fetchErr || !msg) {
        return {
            success: false,
            error: 'Message not found'
        };
    }
    if (msg.sender_id !== user.id) {
        return {
            success: false,
            error: 'Permission denied: You can only edit your own messages'
        };
    }
    // 2. Update content and mark is_edited = true
    const updatedMetadata = {
        ...msg.metadata || {},
        isEdited: true,
        editedAt: new Date().toISOString()
    };
    const { error: updateErr } = await supabase.from('chat_messages').update({
        content: newContent.trim(),
        is_edited: true,
        updated_at: new Date().toISOString(),
        metadata: updatedMetadata
    }).eq('id', messageId);
    if (updateErr) {
        // If is_edited column is missing in schema, update without is_edited column
        const { error: fallbackErr } = await supabase.from('chat_messages').update({
            content: newContent.trim(),
            updated_at: new Date().toISOString(),
            metadata: updatedMetadata
        }).eq('id', messageId);
        if (fallbackErr) {
            return {
                success: false,
                error: fallbackErr.message
            };
        }
    }
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$cache$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["revalidatePath"])('/admin/messages');
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$cache$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["revalidatePath"])('/candidate/messages');
    return {
        success: true
    };
}
async function deleteMessageAction(messageId) {
    const user = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$darion$2d$chat$2f$src$2f$lib$2f$supabase$2f$server$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["getCurrentUserFast"])();
    if (!user) throw new Error('Unauthorized');
    const supabase = await getSupabase();
    // 1. Fetch message to check ownership or admin role
    const { data: msg, error: fetchErr } = await supabase.from('chat_messages').select('id, sender_id, conversation_id').eq('id', messageId).single();
    if (fetchErr || !msg) {
        return {
            success: false,
            error: 'Message not found'
        };
    }
    // 2. Fetch user role
    const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single();
    const isAuthor = msg.sender_id === user.id;
    const isAdmin = profile?.role === 'admin' || profile?.role === 'superadmin' || profile?.role === 'manager';
    if (!isAuthor && !isAdmin) {
        return {
            success: false,
            error: 'Permission denied: You can only delete your own messages'
        };
    }
    // 3. Mark deleted_at
    const { error: delErr } = await supabase.from('chat_messages').update({
        deleted_at: new Date().toISOString(),
        content: '[This message was deleted]'
    }).eq('id', messageId);
    if (delErr) {
        return {
            success: false,
            error: delErr.message
        };
    }
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$cache$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["revalidatePath"])('/admin/messages');
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$cache$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["revalidatePath"])('/candidate/messages');
    return {
        success: true
    };
}
async function forwardMessageAction(payload) {
    const user = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$darion$2d$chat$2f$src$2f$lib$2f$supabase$2f$server$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["getCurrentUserFast"])();
    if (!user) throw new Error('Unauthorized');
    if (!payload.targetConversationIds || payload.targetConversationIds.length === 0) {
        return {
            success: false,
            count: 0,
            error: 'Please select at least one conversation'
        };
    }
    const supabase = await getSupabase();
    // 1. Fetch source message
    const { data: sourceMsg, error: fetchErr } = await supabase.from('chat_messages').select(`
      id,
      content,
      message_type,
      file_url,
      file_name,
      file_size_bytes,
      file_type,
      metadata,
      profiles:sender_id (full_name)
    `).eq('id', payload.messageId).single();
    if (fetchErr || !sourceMsg) {
        return {
            success: false,
            count: 0,
            error: 'Source message not found'
        };
    }
    const originalSenderName = sourceMsg.profiles?.full_name || 'Team Member';
    let forwardCount = 0;
    for (const convId of payload.targetConversationIds){
        let effectiveConvId = convId;
        // Handle fallback default channels if needed
        if (effectiveConvId.startsWith('default-')) {
            const slug = effectiveConvId.replace('default-', '');
            const { data: existingChannel } = await supabase.from('chat_conversations').select('id').eq('slug', slug).maybeSingle();
            if (existingChannel) effectiveConvId = existingChannel.id;
        }
        const forwardedMetadata = {
            ...sourceMsg.metadata || {},
            isForwarded: true,
            originalSenderName,
            originalMessageId: sourceMsg.id,
            forwardedAt: new Date().toISOString()
        };
        const { data: newMsg, error: insErr } = await supabase.from('chat_messages').insert({
            conversation_id: effectiveConvId,
            sender_id: user.id,
            content: payload.additionalComment ? `${payload.additionalComment}\n\n↳ Forwarded from ${originalSenderName}:\n${sourceMsg.content || ''}` : sourceMsg.content || '',
            message_type: sourceMsg.message_type || 'text',
            file_url: sourceMsg.file_url,
            file_name: sourceMsg.file_name,
            file_size_bytes: sourceMsg.file_size_bytes,
            file_type: sourceMsg.file_type,
            metadata: forwardedMetadata
        }).select('id').single();
        if (!insErr && newMsg) {
            forwardCount++;
            // Update conversation last_message_at
            await supabase.from('chat_conversations').update({
                last_message_at: new Date().toISOString(),
                updated_at: new Date().toISOString()
            }).eq('id', effectiveConvId);
        }
    }
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$cache$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["revalidatePath"])('/admin/messages');
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$cache$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["revalidatePath"])('/candidate/messages');
    return {
        success: true,
        count: forwardCount
    };
}
async function createDirectMessageAction(targetUserId) {
    const user = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$darion$2d$chat$2f$src$2f$lib$2f$supabase$2f$server$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["getCurrentUserFast"])();
    if (!user) throw new Error('Unauthorized');
    if (user.id === targetUserId) throw new Error('Cannot start direct message with yourself');
    const supabase = await getSupabase();
    // 1. Check if a DM already exists between these 2 users
    const { data: myConvs } = await supabase.from('chat_participants').select('conversation_id').eq('user_id', user.id);
    if (myConvs && myConvs.length > 0) {
        const convIds = myConvs.map((c)=>c.conversation_id);
        const { data: sharedConvs } = await supabase.from('chat_participants').select('conversation_id, chat_conversations!inner(type)').eq('user_id', targetUserId).in('conversation_id', convIds).eq('chat_conversations.type', 'direct').limit(1);
        if (sharedConvs && sharedConvs.length > 0) {
            return sharedConvs[0].conversation_id;
        }
    }
    // 2. If not found, create new direct conversation
    const { data: newConv, error: convError } = await supabase.from('chat_conversations').insert({
        type: 'direct',
        is_private: true,
        created_by: user.id
    }).select('id').single();
    if (convError || !newConv) {
        throw new Error('Failed to initiate direct message');
    }
    // 3. Add both participants
    await supabase.from('chat_participants').insert([
        {
            conversation_id: newConv.id,
            user_id: user.id,
            role: 'member'
        },
        {
            conversation_id: newConv.id,
            user_id: targetUserId,
            role: 'member'
        }
    ]);
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$cache$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["revalidatePath"])('/admin/messages');
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$cache$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["revalidatePath"])('/candidate/messages');
    return newConv.id;
}
async function createChannelAction(data) {
    const user = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$darion$2d$chat$2f$src$2f$lib$2f$supabase$2f$server$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["getCurrentUserFast"])();
    if (!user) throw new Error('Unauthorized');
    const supabase = await getSupabase();
    const slug = data.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
    const { data: newConv, error } = await supabase.from('chat_conversations').insert({
        type: 'channel',
        name: data.name,
        slug,
        description: data.description || '',
        is_private: data.isPrivate || false,
        created_by: user.id
    }).select('id').single();
    if (error || !newConv) {
        console.error('Error creating channel:', error);
        throw new Error(error?.message || 'Failed to create channel');
    }
    // Add creator as channel admin
    const participants = [
        {
            conversation_id: newConv.id,
            user_id: user.id,
            role: 'admin'
        }
    ];
    if (data.initialMemberIds && data.initialMemberIds.length > 0) {
        for (const memId of data.initialMemberIds){
            if (memId !== user.id) {
                participants.push({
                    conversation_id: newConv.id,
                    user_id: memId,
                    role: 'member'
                });
            }
        }
    }
    await supabase.from('chat_participants').insert(participants);
    // Post system welcome message
    await supabase.from('chat_messages').insert({
        conversation_id: newConv.id,
        sender_id: user.id,
        message_type: 'system',
        content: `created the channel #${data.name}`
    });
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$cache$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["revalidatePath"])('/admin/messages');
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$cache$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["revalidatePath"])('/candidate/messages');
    return newConv.id;
}
async function startInstantMeetInChatAction(conversationId, title) {
    const user = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$darion$2d$chat$2f$src$2f$lib$2f$supabase$2f$server$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["getCurrentUserFast"])();
    if (!user) throw new Error('Unauthorized');
    const supabase = await getSupabase();
    // Generate random room code
    const chars = 'abcdefghijklmnopqrstuvwxyz0123456789';
    const part1 = Array.from({
        length: 3
    }, ()=>chars[Math.floor(Math.random() * chars.length)]).join('');
    const part2 = Array.from({
        length: 4
    }, ()=>chars[Math.floor(Math.random() * chars.length)]).join('');
    const part3 = Array.from({
        length: 3
    }, ()=>chars[Math.floor(Math.random() * chars.length)]).join('');
    const roomCode = `${part1}-${part2}-${part3}`;
    const { data: userProfile } = await supabase.from('profiles').select('full_name').eq('id', user.id).single();
    const hostName = userProfile?.full_name || 'Host';
    const meetTitle = title || 'Live Team Huddle';
    // 1. Create meet_rooms record
    const { data: room, error: roomError } = await supabase.from('meet_rooms').insert({
        room_code: roomCode,
        title: meetTitle,
        host_name: hostName,
        host_id: user.id,
        status: 'active',
        started_at: new Date().toISOString(),
        waiting_room_enabled: false,
        allow_screen_share: true,
        allow_chat: true,
        allow_unmute: true
    }).select().single();
    if (roomError || !room) {
        console.error('Error creating chat meet room:', roomError);
        throw new Error('Failed to create video meeting');
    }
    let effectiveConvId = conversationId;
    if (effectiveConvId.startsWith('default-')) {
        const slug = effectiveConvId.replace('default-', '');
        const { data: existingChannel } = await supabase.from('chat_conversations').select('id').eq('slug', slug).maybeSingle();
        if (existingChannel) {
            effectiveConvId = existingChannel.id;
        } else {
            const channelNames = {
                general: 'General',
                announcements: 'Announcements',
                'shift-operations': 'Shift Operations',
                'hr-support': 'HR & Support'
            };
            const { data: createdChannel } = await supabase.from('chat_conversations').insert({
                type: 'channel',
                name: channelNames[slug] || slug,
                slug,
                is_private: false,
                created_by: user.id
            }).select('id').maybeSingle();
            if (createdChannel) {
                effectiveConvId = createdChannel.id;
            }
        }
    }
    // 2. Post interactive meet card into chat
    const { data: msg } = await supabase.from('chat_messages').insert({
        conversation_id: effectiveConvId,
        sender_id: user.id,
        message_type: 'meet_card',
        content: `started a live video meeting: "${meetTitle}"`,
        metadata: {
            roomId: room.id,
            roomCode: room.room_code,
            title: meetTitle,
            hostName,
            startedAt: room.started_at,
            meetUrl: `/meet/${room.room_code}`
        }
    }).select().single();
    // Dispatch meet_started push notifications
    try {
        const { data: participants } = await supabase.from('chat_participants').select('user_id').eq('conversation_id', effectiveConvId).neq('user_id', user.id);
        if (participants && participants.length > 0) {
            const notifs = participants.map((p)=>({
                    userId: p.user_id,
                    title: `📹 Live Call from ${hostName}`,
                    message: `Joined room #${room.room_code}: "${meetTitle}"`,
                    type: 'meet_started',
                    link: `/meet/${room.room_code}`,
                    metadata: {
                        roomCode: room.room_code,
                        hostName,
                        title: meetTitle
                    }
                }));
            await (0, __TURBOPACK__imported__module__$5b$project$5d2f$darion$2d$chat$2f$src$2f$lib$2f$utils$2f$notifications$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["sendBulkNotification"])(notifs);
        }
    } catch (err) {
        console.error('Error dispatching meet notifications:', err);
    }
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$cache$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["revalidatePath"])('/admin/messages');
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$cache$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["revalidatePath"])('/candidate/messages');
    return {
        roomId: room.id,
        roomCode: room.room_code,
        meetUrl: `/meet/${room.room_code}`,
        messageId: msg?.id
    };
}
async function getUserDirectoryAction(query = '') {
    const user = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$darion$2d$chat$2f$src$2f$lib$2f$supabase$2f$server$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["getCurrentUserFast"])();
    if (!user) return [];
    const supabase = await getSupabase();
    let q = supabase.from('profiles').select(`
      id,
      full_name,
      avatar_url,
      role
    `).neq('id', user.id).order('full_name', {
        ascending: true
    }).limit(50);
    if (query.trim()) {
        q = q.ilike('full_name', `%${query.trim()}%`);
    }
    const { data: profiles, error } = await q;
    if (error || !profiles) return [];
    // Fetch presence
    const userIds = profiles.map((p)=>p.id);
    const { data: presence } = await supabase.from('chat_user_presence').select('user_id, status, status_message, last_seen_at').in('user_id', userIds);
    const presenceMap = new Map((presence || []).map((p)=>[
            p.user_id,
            p
        ]));
    return profiles.map((p)=>{
        const pres = presenceMap.get(p.id);
        return {
            userId: p.id,
            fullName: p.full_name || 'Team Member',
            avatarUrl: p.avatar_url,
            role: p.role || 'candidate',
            status: pres?.status || 'offline',
            statusMessage: pres?.status_message,
            lastSeenAt: pres?.last_seen_at,
            participantRole: 'member'
        };
    });
}
async function markConversationAsReadAction(conversationId) {
    const user = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$darion$2d$chat$2f$src$2f$lib$2f$supabase$2f$server$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["getCurrentUserFast"])();
    if (!user) return;
    const supabase = await getSupabase();
    await supabase.from('chat_participants').update({
        last_read_at: new Date().toISOString()
    }).eq('conversation_id', conversationId).eq('user_id', user.id);
}
async function setUserPresenceAction(status, statusMessage) {
    const user = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$darion$2d$chat$2f$src$2f$lib$2f$supabase$2f$server$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["getCurrentUserFast"])();
    if (!user) return;
    const supabase = await getSupabase();
    await supabase.from('chat_user_presence').upsert({
        user_id: user.id,
        status,
        status_message: statusMessage || null,
        last_seen_at: new Date().toISOString()
    });
}
async function uploadChatAttachmentAction(formData) {
    try {
        const user = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$darion$2d$chat$2f$src$2f$lib$2f$supabase$2f$server$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["getCurrentUserFast"])();
        if (!user) return {
            success: false,
            error: 'Unauthorized'
        };
        const file = formData.get('file');
        const conversationId = formData.get('conversationId') || 'general';
        if (!file) return {
            success: false,
            error: 'No file provided'
        };
        const supabase = await getSupabase();
        const fileExt = file.name.split('.').pop() || 'bin';
        const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;
        const filePath = `chat/${conversationId}/${fileName}`;
        const arrayBuffer = await file.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);
        let targetBucket = 'chat-attachments';
        let { data, error } = await supabase.storage.from(targetBucket).upload(filePath, buffer, {
            contentType: file.type || 'application/octet-stream',
            upsert: true
        });
        if (error) {
            console.warn(`Upload to ${targetBucket} failed, trying meet-files:`, error);
            targetBucket = 'meet-files';
            const retry = await supabase.storage.from(targetBucket).upload(filePath, buffer, {
                contentType: file.type || 'application/octet-stream',
                upsert: true
            });
            if (retry.error) {
                throw new Error(retry.error.message);
            }
            data = retry.data;
        }
        const { data: publicUrlData } = supabase.storage.from(targetBucket).getPublicUrl(filePath);
        return {
            success: true,
            url: publicUrlData.publicUrl
        };
    } catch (err) {
        console.error('Chat attachment upload error:', err);
        return {
            success: false,
            error: err?.message || 'Failed to upload attachment'
        };
    }
}
;
(0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$build$2f$webpack$2f$loaders$2f$next$2d$flight$2d$loader$2f$action$2d$validate$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["ensureServerEntryExports"])([
    getConversationsListAction,
    getUnreadMessagesCountAction,
    getConversationMessagesAction,
    sendMessageAction,
    toggleReactionAction,
    editMessageAction,
    deleteMessageAction,
    forwardMessageAction,
    createDirectMessageAction,
    createChannelAction,
    startInstantMeetInChatAction,
    getUserDirectoryAction,
    markConversationAsReadAction,
    setUserPresenceAction,
    uploadChatAttachmentAction
]);
(0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$build$2f$webpack$2f$loaders$2f$next$2d$flight$2d$loader$2f$server$2d$reference$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["registerServerReference"])(getConversationsListAction, "0026cf27b9519f8337b7093d9260e4f1d242ddf8a5", null);
(0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$build$2f$webpack$2f$loaders$2f$next$2d$flight$2d$loader$2f$server$2d$reference$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["registerServerReference"])(getUnreadMessagesCountAction, "0087fd72aeda3b5135a300facaa73973f18db18f57", null);
(0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$build$2f$webpack$2f$loaders$2f$next$2d$flight$2d$loader$2f$server$2d$reference$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["registerServerReference"])(getConversationMessagesAction, "60ce227253d3d6e37c786950b046b72f6a939fd768", null);
(0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$build$2f$webpack$2f$loaders$2f$next$2d$flight$2d$loader$2f$server$2d$reference$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["registerServerReference"])(sendMessageAction, "4017178f4d1c77e5f1e06fffd2f79b6b5053b286e8", null);
(0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$build$2f$webpack$2f$loaders$2f$next$2d$flight$2d$loader$2f$server$2d$reference$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["registerServerReference"])(toggleReactionAction, "6093c5f335e765ba5b6e0c710b2e2f204d2dcf3657", null);
(0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$build$2f$webpack$2f$loaders$2f$next$2d$flight$2d$loader$2f$server$2d$reference$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["registerServerReference"])(editMessageAction, "60d0e338caac30e5d0e61dbfd8006071fe8a3cef10", null);
(0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$build$2f$webpack$2f$loaders$2f$next$2d$flight$2d$loader$2f$server$2d$reference$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["registerServerReference"])(deleteMessageAction, "4003f015091238bcd00be8e8bb3700aeb23073a5d6", null);
(0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$build$2f$webpack$2f$loaders$2f$next$2d$flight$2d$loader$2f$server$2d$reference$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["registerServerReference"])(forwardMessageAction, "40a1dca22df4c709fb651c525b88a983bfb2400fe5", null);
(0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$build$2f$webpack$2f$loaders$2f$next$2d$flight$2d$loader$2f$server$2d$reference$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["registerServerReference"])(createDirectMessageAction, "4076631d0e2fe1430e2df2fa553c3b5a804ab4638a", null);
(0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$build$2f$webpack$2f$loaders$2f$next$2d$flight$2d$loader$2f$server$2d$reference$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["registerServerReference"])(createChannelAction, "40089b13a5cc7e75ea918267a4d1d14bdec1118c65", null);
(0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$build$2f$webpack$2f$loaders$2f$next$2d$flight$2d$loader$2f$server$2d$reference$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["registerServerReference"])(startInstantMeetInChatAction, "60b0d022ae5ad8984c24004189b01296aa666a2456", null);
(0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$build$2f$webpack$2f$loaders$2f$next$2d$flight$2d$loader$2f$server$2d$reference$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["registerServerReference"])(getUserDirectoryAction, "40fc57de8ae7de18e7e144a5c07ddbdb9da5320239", null);
(0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$build$2f$webpack$2f$loaders$2f$next$2d$flight$2d$loader$2f$server$2d$reference$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["registerServerReference"])(markConversationAsReadAction, "404c684b8a2e6cd8e7a0ff6425370f0ca6d6ea4cb3", null);
(0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$build$2f$webpack$2f$loaders$2f$next$2d$flight$2d$loader$2f$server$2d$reference$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["registerServerReference"])(setUserPresenceAction, "60d991f714debd4d08b7b6085bfa4b3efc936ef235", null);
(0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$build$2f$webpack$2f$loaders$2f$next$2d$flight$2d$loader$2f$server$2d$reference$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["registerServerReference"])(uploadChatAttachmentAction, "402c35a0b4cd9b7078e08a0a70ea09a750c3aff865", null);
}),
"[project]/darion-chat/src/lib/meet/googleDrive.ts [app-rsc] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "uploadBufferToGoogleDrive",
    ()=>uploadBufferToGoogleDrive
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$googleapis$2f$build$2f$src$2f$index$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/googleapis/build/src/index.js [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$externals$5d2f$stream__$5b$external$5d$__$28$stream$2c$__cjs$29$__ = __turbopack_context__.i("[externals]/stream [external] (stream, cjs)");
;
;
/**
 * Gets an authenticated Google Drive client using either:
 * 1. Service Account (GOOGLE_SERVICE_ACCOUNT_EMAIL & GOOGLE_PRIVATE_KEY or GOOGLE_SERVICE_ACCOUNT_JSON)
 * 2. OAuth2 Refresh Token (GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET, GOOGLE_REFRESH_TOKEN)
 */ function getGoogleDriveClient() {
    const serviceAccountJson = process.env.GOOGLE_SERVICE_ACCOUNT_JSON;
    const clientEmail = process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL;
    const rawPrivateKey = process.env.GOOGLE_PRIVATE_KEY;
    const clientId = process.env.GOOGLE_CLIENT_ID;
    const clientSecret = process.env.GOOGLE_CLIENT_SECRET;
    const refreshToken = process.env.GOOGLE_REFRESH_TOKEN;
    // Option 3: OAuth2 Refresh Token (Prioritized)
    if (clientId && clientSecret && refreshToken) {
        const auth = new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$googleapis$2f$build$2f$src$2f$index$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["google"].auth.OAuth2(clientId, clientSecret);
        auth.setCredentials({
            refresh_token: refreshToken
        });
        return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$googleapis$2f$build$2f$src$2f$index$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["google"].drive({
            version: 'v3',
            auth
        });
    }
    // Option 1: Full Service Account JSON string
    if (serviceAccountJson) {
        try {
            const credentials = JSON.parse(serviceAccountJson);
            const auth = new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$googleapis$2f$build$2f$src$2f$index$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["google"].auth.JWT({
                email: credentials.client_email,
                key: credentials.private_key,
                scopes: [
                    'https://www.googleapis.com/auth/drive.file',
                    'https://www.googleapis.com/auth/drive'
                ]
            });
            return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$googleapis$2f$build$2f$src$2f$index$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["google"].drive({
                version: 'v3',
                auth
            });
        } catch (e) {
            console.error('Failed to parse GOOGLE_SERVICE_ACCOUNT_JSON:', e);
        }
    }
    // Option 2: Individual Service Account Email + Private Key
    if (clientEmail && rawPrivateKey) {
        const privateKey = rawPrivateKey.replace(/\\n/g, '\n');
        const auth = new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$googleapis$2f$build$2f$src$2f$index$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["google"].auth.JWT({
            email: clientEmail,
            key: privateKey,
            scopes: [
                'https://www.googleapis.com/auth/drive.file',
                'https://www.googleapis.com/auth/drive'
            ]
        });
        return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$googleapis$2f$build$2f$src$2f$index$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["google"].drive({
            version: 'v3',
            auth
        });
    }
    return null;
}
async function uploadBufferToGoogleDrive(params) {
    const drive = getGoogleDriveClient();
    if (!drive) {
        return {
            success: false,
            error: 'Google Drive credentials not found in environment variables (GOOGLE_SERVICE_ACCOUNT_EMAIL or GOOGLE_CLIENT_ID/REFRESH_TOKEN).'
        };
    }
    try {
        const folderId = params.folderId || process.env.GOOGLE_DRIVE_FOLDER_ID || undefined;
        const mimeType = params.mimeType || 'video/webm';
        const fileMetadata = {
            name: params.fileName,
            mimeType
        };
        if (folderId) {
            fileMetadata.parents = [
                folderId
            ];
        }
        const stream = __TURBOPACK__imported__module__$5b$externals$5d2f$stream__$5b$external$5d$__$28$stream$2c$__cjs$29$__["Readable"].from(params.buffer);
        // 1. Upload the file to Google Drive
        const response = await drive.files.create({
            supportsAllDrives: true,
            requestBody: fileMetadata,
            media: {
                mimeType,
                body: stream
            },
            fields: 'id, name, webViewLink, webContentLink'
        });
        const fileId = response.data.id;
        if (!fileId) {
            return {
                success: false,
                error: 'Google Drive did not return a file ID.'
            };
        }
        // 2. Set file permissions so anyone with the link can view
        try {
            await drive.permissions.create({
                fileId,
                supportsAllDrives: true,
                requestBody: {
                    role: 'reader',
                    type: 'anyone'
                }
            });
        } catch (permErr) {
            console.warn('Could not set public permission on Google Drive file:', permErr);
        }
        return {
            success: true,
            fileId,
            webViewLink: response.data.webViewLink || `https://drive.google.com/file/d/${fileId}/view`,
            webContentLink: response.data.webContentLink || undefined
        };
    } catch (err) {
        console.error('Google Drive Upload Error:', err);
        return {
            success: false,
            error: err?.message || 'Failed to upload file to Google Drive.'
        };
    }
}
}),
"[project]/darion-chat/src/lib/supabase/server.ts [app-rsc] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "createAdminClient",
    ()=>createAdminClient,
    "createClient",
    ()=>createClient,
    "getCurrentUserFast",
    ()=>getCurrentUserFast
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$supabase$2f$ssr$2f$dist$2f$module$2f$createServerClient$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/@supabase/ssr/dist/module/createServerClient.js [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$headers$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/headers.js [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/server/route-modules/app-page/vendored/rsc/react.js [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$supabase$2f$supabase$2d$js$2f$dist$2f$index$2e$mjs__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/node_modules/@supabase/supabase-js/dist/index.mjs [app-rsc] (ecmascript) <locals>");
;
;
;
async function createClient() {
    const cookieStore = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$headers$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["cookies"])();
    return (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$supabase$2f$ssr$2f$dist$2f$module$2f$createServerClient$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["createServerClient"])(("TURBOPACK compile-time value", "https://mtovhnzkzvoxihtrrllv.supabase.co"), ("TURBOPACK compile-time value", "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im10b3ZobnprenZveGlodHJybGx2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODY2MDM1NjYsImV4cCI6MjEwMjE3OTU2Nn0.T0O4SMFI8JTj7elUwxu6ELu_aTNy7PC3D5D4fSSm4nc"), {
        cookies: {
            getAll () {
                return cookieStore.getAll();
            },
            setAll (cookiesToSet) {
                try {
                    cookiesToSet.forEach(({ name, value, options })=>cookieStore.set(name, value, options));
                } catch  {
                // Called from a Server Component. Can be ignored if middleware updates session.
                }
            }
        }
    });
}
;
function createAdminClient() {
    const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
    if (!serviceKey) {
        throw new Error('SUPABASE_SERVICE_ROLE_KEY is not defined in environment variables.');
    }
    return (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$supabase$2f$supabase$2d$js$2f$dist$2f$index$2e$mjs__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__$3c$locals$3e$__["createClient"])(("TURBOPACK compile-time value", "https://mtovhnzkzvoxihtrrllv.supabase.co"), serviceKey, {
        auth: {
            autoRefreshToken: false,
            persistSession: false
        }
    });
}
const getCurrentUserFast = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["cache"])(async ()=>{
    try {
        const reqHeaders = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$headers$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["headers"])();
        const userId = reqHeaders.get('x-user-id');
        const role = reqHeaders.get('x-user-role');
        if (userId && role) {
            return {
                id: userId,
                role
            };
        }
    } catch  {
    // Header reading fallback
    }
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return null;
    return {
        id: user.id,
        role: user.user_metadata?.role || 'candidate'
    };
});
}),
"[project]/darion-chat/src/lib/utils/notifications.ts [app-rsc] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "sendBulkNotification",
    ()=>sendBulkNotification,
    "sendNotification",
    ()=>sendNotification
]);
async function sendNotification(data) {
    return {
        success: true
    };
}
async function sendBulkNotification(items) {
    return {
        success: true
    };
}
}),
];

//# sourceMappingURL=%5Broot-of-the-server%5D__1ug1b4x._.js.map