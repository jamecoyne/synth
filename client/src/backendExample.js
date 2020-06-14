import React, {useEffect, useState} from 'react';

const BackendExample = () =>{

    const[resState, setResState] = useState({
        response:String,
        post:String,
        responseToPost:String
    })

    useEffect(() => {
        callApi()
        .then(res => setResState({ response: res.express }))
        .catch(err => console.log(err));
    });

    const callApi = async () => {
        const response = await fetch('/api/hello');
        const body = await response.json();
        if (response.status !== 200) throw Error(body.message);
        
        return body;
    };

    const handleSubmit = async e => {
        e.preventDefault();
        const response = await fetch('/api/world', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ post: this.state.post }),
        });
        const body = await response.text();
        setResState({ responseToPost: body })
    };

    return(
    <div>
         <p>{resState.response}</p>
        <form onSubmit={handleSubmit}>
          <p>
            <strong>Post to Server:</strong>
          </p>
          <input
            type={"text"}
            value={resState.post}
            onChange={e => setResState({ post: e.target.value })}
          />
          <button type={"submit"}>Submit</button>
        </form>
        <p>{resState.responseToPost}</p>
    </div>
    )
}


export default BackendExample