// made by recanman
const GetStaticAsset = async (res, url) => {
    return new Promise((resolve, reject) => {
        fetch(url).then(data => {
			data.body.pipeTo(
				new WritableStream({
					start() {
						data.headers.forEach((v, n) => res.setHeader(n, v))
                  	},
                  	write(chunk) {
                    	res.write(chunk)
                  	},
                  	close() {
                    	res.end()
                    	resolve()
                 	}
				})
			)
		}).catch(reject)
	})
}

module.exports = {
	GetStaticAsset
}