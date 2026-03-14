import React,{useState} from "react";
import API from "../services/api";

const DocumentAnalyzer = () => {

  const [file,setFile] = useState(null);
  const [result,setResult] = useState("");

  const uploadFile = async () => {

    const formData = new FormData();

    formData.append("file",file);

    const res = await API.post(
      "/documents/analyze",
      formData
    );

    setResult(res.data.summary);

  }

  return(

    <div>

      <h1 className="text-xl font-bold mb-3">
        AI Document Analyzer
      </h1>

      <input
      type="file"
      onChange={(e)=>setFile(e.target.files[0])}
      />

      <button
      className="bg-blue-900 text-white p-2 ml-2"
      onClick={uploadFile}
      >
        Analyze
      </button>

      <div className="mt-4">
        {result}
      </div>

    </div>

  )

}

export default DocumentAnalyzer