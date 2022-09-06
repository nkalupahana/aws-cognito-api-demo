import { useEffect } from "react";

const AuthCallback = () => {
    useEffect(() => {
        (async () => {
            const code = window.location.search.split("=")[1];
            fetch("https://bettysbrain.auth.us-east-1.amazoncognito.com/oauth2/token", {
                method: "POST",
                headers: {
                    "Content-Type": "application/x-www-form-urlencoded",
                    "Accept": "*/*",

                  },
                  body: `grant_type=authorization_code&code=${code}&client_id=5cpfhft5pf8877epe31kinanb8&redirect_uri=http://localhost:3000/callback`
            }).then(resp => resp.json()).then(data => {
                if ("id_token" in data) {
                    localStorage.setItem("id_token", data.id_token);
                    window.location.replace("/");
                }
            });
        })();
    }, []);

    return <p>One second, we're signing you in.</p>
};

export default AuthCallback;