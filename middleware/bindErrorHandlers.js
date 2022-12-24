function bindErrorHandlers(logger) {
    process.on('unhandledRejection', async (error, promise) => {
        try {
            await promise;
            promise.handled = true;
        } catch (e) {
            console.log(e.message)
        }
    });
    process.on("rejectionHandled", (error) => {
        logger.error(error.message)
    })
}

module.exports = bindErrorHandlers;