/* --------------------------------------------------------------------------------------------
 * Copyright (c) 2018 TypeFox GmbH (http://www.typefox.io). All rights reserved.
 * Licensed under the MIT License. See License.txt in the project root for license information.
 * ------------------------------------------------------------------------------------------ */
import * as rpc from "vscode-ws-jsonrpc/lib";
import * as server from "vscode-ws-jsonrpc/lib/server";
import * as lsp from "vscode-languageserver/lib/main";

export function launch(socket: rpc.IWebSocket) {
    const reader = new rpc.WebSocketMessageReader(socket);
    const writer = new rpc.WebSocketMessageWriter(socket);
    // start the language server as an external process
    const socketConnection = server.createConnection(reader, writer, () => socket.dispose());
    const serverConnection = server.createServerProcess('powershell', 'pwsh-preview', [__dirname + '/PowerShellEditorServices/PowerShellEditorServices/Start-EditorServices.ps1', '-HostName', 'monaco', '-HostProfileId', '0', '-HostVersion', '1.0.0', '-LogPath', __dirname + '/logs/pses.log.txt', '-LogLevel', 'Diagnostic', '-BundledModulesPath', __dirname + '/PowerShellEditorServices', '-Stdio', '-SessionDetailsPath', __dirname + '/.pses_session', '-FeatureFlags', '@()']);
    server.forward(socketConnection, serverConnection, message => {
        if (rpc.isRequestMessage(message)) {
            if (message.method === lsp.InitializeRequest.type.method) {
                const initializeParams = message.params as lsp.InitializeParams;
                initializeParams.processId = process.pid;
            }
        }
        return message;
    });
}
