import odbc from "odbc";

async function test() {
  try {
    const conn = await odbc.connect(
      `Driver={ODBC Driver 17 for SQL Server};
   Server=SQL\\SQLSERVERGP;
   Database=etiquetas_bd;
   Uid=userdb;
   Pwd=Macero9542;
   TrustServerCertificate=Yes;`
    );
    console.log("Conexión exitosa!");
    await conn.close();
  } catch (err) {
    console.error("Error:", err);
  }
}

function testEncoding() {
  let str = "ESPA├æA";
  console.log("Antes de decodificar:", str);
  str = Buffer.from(str, "binary").toString("utf8");
  console.log("Después de decodificar:", str);
}

testEncoding();
