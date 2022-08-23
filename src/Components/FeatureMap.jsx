import { useState, useEffect } from 'react';
import JSZip from 'jszip';
import {
  fileSetting,
  startFn,
  download,
  csv2table,
  previewThead,
  previewTbody,
  errorHandler,
} from 'js/common';
import { featureMapAPI } from 'js/miningAPI';
import Loading from 'Components/Common/Loading';
import Header from './Common/Header';
import SideBar from './Common/SideBar';
import DataUploadComp from './Common/DataUploadComp';

const FeatureMap = () => {
  const [fileInfo, setFileInfo] = useState({
    file: '',
    name: '',
  });
  const [table, setTable] = useState({
    tBody: [],
    tHead: [],
  });
  const [parse, setParse] = useState([]);
  const [url, setUrl] = useState('');
  const [msg, setMsg] = useState('');
  const [tab, setTab] = useState('');

  const fileSettingState = { setFileInfo, tab, setTab, setMsg };
  const startParamState = { msg, setMsg, setTab, fileInfo };
  const downloadState = { fileInfo, url, tab };

  useEffect(() => {
    document.title = 'AI 학습용 데이터셋 생성 | MINING CLOUD';
  }, []);

  //피처맵 api 요청
  const featureMap = async e => {
    if (startFn(e, startParamState)) {
      const result = await featureMapAPI(
        fileInfo.file,
        e.textContent.toLowerCase()
      );
      if (typeof result === 'object') {
        if (result.data === null)
          return alert('업로드한 파일을 확인해 주세요.');
        if (e.textContent === 'Balancing') {
          const blob = new Blob([result.data], {
            type: 'text/csv',
          });
          setUrl(window.URL.createObjectURL(blob));
          setMsg('download');
          csv2table(result.data, setTable);
        } else if (e.textContent === 'Partitioning') {
          const blob = new Blob([result.data], {
            type: 'application/octet-stream',
          });
          setUrl(window.URL.createObjectURL(blob));
          setMsg('download');
        }
      } else return errorHandler(result, fileSettingState);
    } else return;
  };

  return (
    <section className='content-container'>
      <SideBar />
      <div>
        <Header />
        <div className='content-wrap'>
          <h3 className='bold'>AI 학습용 데이터셋 생성</h3>
          <hr />
          <div>
            <label htmlFor='fileUpload'>파일 업로드</label>
            <input
              type='file'
              id='fileUpload'
              onChange={e => fileSetting(e, fileSettingState)}
              accept='.csv'
            />
            <button
              onClick={e => featureMap(e.target)}
              className={tab === 'Balancing' ? 'active' : ''}>
              Balancing
            </button>
            <button
              onClick={e => featureMap(e.target)}
              className={tab === 'Partitioning' ? 'active' : ''}>
              Partitioning
            </button>
            <br />
            <DataUploadComp fileName={fileInfo.name} />
            {tab === 'Balancing'
              ? msg === 'download' && (
                  <div className='wrap'>
                    <h2 className='previewTitle'>Preview</h2>
                    <div className='previewTable'>
                      <table>
                        <thead>
                          <tr>
                            <th>1</th>
                            {previewThead(table)}
                          </tr>
                        </thead>
                        <tbody>{previewTbody(table)}</tbody>
                      </table>
                    </div>
                    <div className='downloadBtnWrap'>
                      <button onClick={() => download(downloadState)}>
                        다운로드
                      </button>
                    </div>
                  </div>
                )
              : msg === 'download' && (
                  <div className='wrap'>
                    <div className='previewTable partitioning'>
                      <table>
                        <colgroup>
                          <col width={'600px'} />
                        </colgroup>
                        <thead>
                          <tr>
                            <th>Files</th>
                          </tr>
                        </thead>
                        <tbody>
                          <tr>
                            <td>y_val.csv</td>
                          </tr>
                          <tr>
                            <td>y_train.csv</td>
                          </tr>
                          <tr>
                            <td>y_test.csv</td>
                          </tr>
                          <tr>
                            <td>x_val.csv</td>
                          </tr>
                          <tr>
                            <td>x_train.csv</td>
                          </tr>
                          <tr>
                            <td>x_test.csv</td>
                          </tr>
                        </tbody>
                      </table>
                    </div>
                    <div className='downloadBtnWrap'>
                      <button onClick={() => download(downloadState)}>
                        ZIP 다운로드
                      </button>
                    </div>
                  </div>
                )}
          </div>
        </div>
        <Loading msg={msg} />
      </div>
    </section>
  );
};

export default FeatureMap;
