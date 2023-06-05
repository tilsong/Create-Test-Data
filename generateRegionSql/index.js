const fs = require('fs');

const schema = process.argv[2];

const outputFileName = './region_insert.sql';
const regionNames = ["강원", "경기", "경남", "경북", "광주", "대구", "대전", "부산", "서울", "세종", "울산", "인천", "전남", "전북", "제주", "충남", "충북"];

const generateRegionSQL = () => {
    const writeStream = fs.createWriteStream(outputFileName, { flags: 'a' });

    const prefix = `INSERT INTO ${schema}.region (full_address, unit_address, point, created_time, updated_time) `;

    for(const regionName of regionNames) {
        const filePath = `./regionCSV/${regionName}_좌표.csv`
        let sql = "";

        try {
            const data = fs.readFileSync(filePath, 'utf-8');
            const lines = data.split('\n');
    
            for (let i = 0; i < lines.length; i++) {
                const line = lines[i].trim();
                if (line === '') continue;
    
                const parts = line.split(',');

                sql += ` ${prefix} VALUES ('${parts[0]}', '${parts[1]}', ST_PointFromText('POINT(${parts[2]} ${parts[3]})', 5179) , '2023-05-30 01:18:20', '2023-05-30 01:18:20');
                `;
            }
    
            writeStream.write(sql);
        } catch(e) {
            console.log(e);
        }
    }
    writeStream.end();
}

generateRegionSQL();
