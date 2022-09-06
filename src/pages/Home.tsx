import AWS, { CognitoIdentityCredentials, DynamoDB } from "aws-sdk";
import { useEffect, useState } from "react";

AWS.config.update({"region": "us-east-1"});

const idToken = localStorage.getItem("id_token");
let client: DynamoDB.DocumentClient | undefined = undefined;
if (idToken) {
    client = new DynamoDB.DocumentClient({
        credentials: new CognitoIdentityCredentials({
            IdentityPoolId: "us-east-1:824220c5-3885-42a2-afbc-3d9480d3d55e",
            Logins: {
                "cognito-idp.us-east-1.amazonaws.com/us-east-1_SOd98gjVq": idToken,
            },
        }),
    });
}

interface Data {
    sessionId: string;
    diff: any;
}

const Home = () => {
    const [autosaveData, setAutosaveData] = useState<Data[]>([]);

    useEffect(() => {
        if (!client) return;
        client.scan({
            TableName: "bettysbrain_autosave"
        }, (_, data) => {
            if (data && data.Items) {
                let processedData = data.Items.map(item => {
                    return { "id": item.sessionId, "state": JSON.parse(item.state) }
                });

                let diffs = processedData.map(item => {
                    return { "sessionId": item.id, "diff": item?.state?.actionTracker?.actions?.slice(-1)[0].diff as any }
                }).filter(item => item.diff !== undefined);

                setAutosaveData(diffs);
            }
        });
    }, []);

    return <div>
        { !client && <input type="button" value="Login" onClick={() => window.location.replace("https://bettysbrain.auth.us-east-1.amazoncognito.com/login?response_type=code&client_id=5cpfhft5pf8877epe31kinanb8&redirect_uri=http://localhost:3000/callback")} /> }
        { client && <> 
            <p>Signed in!</p>
            <input type="button" value="Logout" onClick={() => {
                localStorage.removeItem("id_token");
                window.location.replace("/");
            }} />
            <table>
                <thead>
                    <tr>
                        <th>Session ID</th>
                        <th>Missing Entities</th>
                        <th>Missing Links</th>
                        <th>Extra Links</th>
                        <th>Reversed Links</th>
                        <th>Backwards Links</th>
                        <th>Shortcut Links</th>
                    </tr>
                </thead>
                <tbody>
                    { autosaveData.map(item => {
                        return <tr key={item.sessionId}>
                            <td>{ item.sessionId }</td>
                            <td>{ item.diff.entities.missing }</td>
                            <td>{ item.diff.links.missing }</td>
                            <td>{ item.diff.links.extra }</td>
                            <td>{ item.diff.links.reversed }</td>
                            <td>{ item.diff.links.backwards }</td>
                            <td>{ item.diff.links.shortcut }</td>
                        </tr>
                    }) }
                </tbody>
            </table>
        </> }
    </div>
};

export default Home;