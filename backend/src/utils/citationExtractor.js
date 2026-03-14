exports.extractLegalCitations = (text) => {

    if(!text) return [];

    const patterns = [
        /Section\s+\d+/gi,
        /IPC\s+\d+/gi,
        /CrPC\s+\d+/gi,
        /Article\s+\d+/gi
    ];

    let citations = [];

    patterns.forEach(pattern => {

        const matches = text.match(pattern);

        if(matches){
            citations.push(...matches);
        }

    });

    return [...new Set(citations)];
};