const baseUrl = process.env.REACT_APP_BASEURL;

function LogOut({ history }) {
    fetch(`${baseUrl}/auth/logout`)
        .then(res => res.json())
        .then(res => {
            history.push('/')
        })
        .catch(err => console.log(err))
}

export default LogOut;