// made by recanman
const GetImage = async (res, board_code, file_name) => {
    return new Promise((resolve, reject) => {
        fetch(`${process.env.CDN_BASE_URL}${board_code}/${file_name}`).then(data => {
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
    GetImage
}