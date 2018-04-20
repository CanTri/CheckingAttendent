package edmt.dev.cognitiveidentifyface;

import android.app.ProgressDialog;
import android.content.Intent;
import android.graphics.Bitmap;
import android.graphics.BitmapFactory;
import android.graphics.Canvas;
import android.graphics.Color;
import android.graphics.Paint;
import android.graphics.drawable.BitmapDrawable;
import android.net.Uri;
import android.os.AsyncTask;
import android.provider.MediaStore;
import android.support.v7.app.AppCompatActivity;
import android.os.Bundle;
import android.support.v7.view.CollapsibleActionView;
import android.util.Log;
import android.view.View;
import android.widget.Button;
import android.widget.ImageView;
import android.widget.Toast;

import com.microsoft.projectoxford.face.FaceServiceClient;
import com.microsoft.projectoxford.face.FaceServiceRestClient;
import com.microsoft.projectoxford.face.contract.Face;
import com.microsoft.projectoxford.face.contract.FaceRectangle;
import com.microsoft.projectoxford.face.contract.IdentifyResult;
import com.microsoft.projectoxford.face.contract.Person;
import com.microsoft.projectoxford.face.contract.TrainingStatus;
import com.microsoft.projectoxford.face.rest.ClientException;

import org.json.JSONException;

import java.io.ByteArrayInputStream;
import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.io.InputStream;
import java.io.UnsupportedEncodingException;
import java.util.UUID;

public class MainActivity extends AppCompatActivity {

    private final int PICK_IMAGE = 1;
    private ProgressDialog detectionProgressDialog;
    private static final int RC_CAMERA_VERIFY = 102;
    private FaceServiceClient faceServiceClient =
            new FaceServiceRestClient("https://westcentralus.api.cognitive.microsoft.com/face/v1.0", "5bc3dbb78e434b19b611b2a69892d4e0");
    ImageView imageView;
    Bitmap mBitmap;
    Face[] facesDetected;
    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_main);
        Button button1 = (Button)findViewById(R.id.button1);
        button1.setOnClickListener(new View.OnClickListener() {
            @Override
            public void onClick(View v) {
//                Intent gallIntent = new Intent(Intent.ACTION_GET_CONTENT);
//                gallIntent.setType("image/*");
//                startActivityForResult(Intent.createChooser(gallIntent, "Select Picture"), PICK_IMAGE);

                Intent intent = new Intent(MediaStore.ACTION_IMAGE_CAPTURE);
                startActivityForResult(intent, RC_CAMERA_VERIFY);

//                mBitmap = BitmapFactory.decodeResource(getResources(),R.drawable.tunghiep);
//                imageView = (ImageView)findViewById(R.id.imageView1);
//                imageView.setImageBitmap(mBitmap);
//                detectAndFrame(mBitmap);
            }
        });
        Button button = (Button)findViewById(R.id.button);
        button.setOnClickListener(new View.OnClickListener() {
            @Override
            public void onClick(View view) {
                final UUID[] faceIds = new UUID[facesDetected.length];
                Log.wtf("Hiep","Hhehe" + String.valueOf(facesDetected.length));
                for(int i=0;i<facesDetected.length;i++){
                    faceIds[i] = facesDetected[i].faceId;
                    Log.wtf("Hiep",String.valueOf(faceIds[i]));
                }
                new IdentificationTask("14ctt").execute(faceIds);

            }
        });

        detectionProgressDialog = new ProgressDialog(this);
    }
    @Override
    protected void onActivityResult(int requestCode, int resultCode, Intent data) {
        super.onActivityResult(requestCode, resultCode, data);
        if (requestCode == PICK_IMAGE && resultCode == RESULT_OK && data != null && data.getData() != null) {
            Uri uri = data.getData();
            try {
                Bitmap bitmap = MediaStore.Images.Media.getBitmap(getContentResolver(), uri);
                ImageView imageView = (ImageView) findViewById(R.id.imageView1);
                imageView.setImageBitmap(bitmap);
                detectAndFrame(bitmap);
            } catch (IOException e) {
                e.printStackTrace();
            }
        }
        if (resultCode == RESULT_OK) {
            switch (requestCode) {
                case RC_CAMERA_VERIFY:
                   // Bitmap image = (Bitmap) data.getExtras().get("data");
                    Bitmap bitmap = (Bitmap) data.getExtras().get("data");;
                    ImageView imageView = (ImageView) findViewById(R.id.imageView1);
                    imageView.setImageBitmap(bitmap);
                    detectAndFrame(bitmap);
            }
        }
    }
    private void detectAndFrame(final Bitmap imageBitmap)
    {
        ByteArrayOutputStream outputStream = new ByteArrayOutputStream();
        imageBitmap.compress(Bitmap.CompressFormat.JPEG, 100, outputStream);
        ByteArrayInputStream inputStream =
                new ByteArrayInputStream(outputStream.toByteArray());
        AsyncTask<InputStream, String, Face[]> detectTask =
                new AsyncTask<InputStream, String, Face[]>() {
                    @Override
                    protected Face[] doInBackground(InputStream... params) {
                        try {
                            publishProgress("Detecting...");
                            Face[] result = faceServiceClient.detect(
                                    params[0],
                                    true,         // returnFaceId
                                    false,        // returnFaceLandmarks
                                    null           // returnFaceAttributes: a string like "age, gender"
                            );
                            if (result == null)
                            {
                                publishProgress("Detection Finished. Nothing detected");
                                Toast.makeText(MainActivity.this,"Detection Finished. Nothing detected",Toast.LENGTH_SHORT).show();
                                return null;
                            }
                            publishProgress(
                                    String.format("Detection Finished. %d face(s) detected",
                                            result.length));
                            Log.wtf("Hiep",""+result.length);
                            return result;
                        } catch (Exception e) {
                            publishProgress("Detection failed");
                            return null;
                        }
                    }
                    @Override
                    protected void onPreExecute() {

                        detectionProgressDialog.show();
                    }
                    @Override
                    protected void onProgressUpdate(String... progress) {

                        detectionProgressDialog.setMessage(progress[0]);
                    }
                    @Override
                    protected void onPostExecute(Face[] result) {

                        detectionProgressDialog.dismiss();
                        if (result == null) {
                            Toast.makeText(MainActivity.this,"Ko co face",Toast.LENGTH_SHORT).show();
                            return;
                        }
                        else {
                            Toast.makeText(MainActivity.this, "Co face nha", Toast.LENGTH_SHORT).show();
                            facesDetected = result;
                        }
                        ImageView imageView = (ImageView)findViewById(R.id.imageView1);
                        imageView.setImageBitmap(drawFaceRectanglesOnBitmap(imageBitmap, result));
                        imageBitmap.recycle();
                    }
                };
        detectTask.execute(inputStream);
    }
    private static Bitmap drawFaceRectanglesOnBitmap(Bitmap originalBitmap, Face[] faces) {
        Bitmap bitmap = originalBitmap.copy(Bitmap.Config.ARGB_8888, true);
        Canvas canvas = new Canvas(bitmap);
        Paint paint = new Paint();
        paint.setAntiAlias(true);
        paint.setStyle(Paint.Style.STROKE);
        paint.setColor(Color.RED);
        int stokeWidth = 1;
        paint.setStrokeWidth(stokeWidth);
        if (faces != null) {
            for (Face face : faces) {
                FaceRectangle faceRectangle = face.faceRectangle;
                canvas.drawRect(
                        faceRectangle.left,
                        faceRectangle.top,
                        faceRectangle.left + faceRectangle.width,
                        faceRectangle.top + faceRectangle.height,
                        paint);
            }
        }
        return bitmap;
    }
    private class IdentificationTask extends AsyncTask<UUID,String,IdentifyResult[]> {
        String personGroupId;

        private ProgressDialog mDialog = new ProgressDialog(MainActivity.this);

        public IdentificationTask(String personGroupId) {
            this.personGroupId = personGroupId;
        }

        @Override
        protected IdentifyResult[] doInBackground(UUID... params) {

            try{
                publishProgress("Getting person group status...");
                TrainingStatus trainingStatus  = faceServiceClient.getPersonGroupTrainingStatus(this.personGroupId);
                if(trainingStatus.status != TrainingStatus.Status.Succeeded)
                {
                    publishProgress("Person group training status is "+trainingStatus.status);
                    return null;
                }
                publishProgress("Identifying...");

                IdentifyResult[] results = faceServiceClient.identity(personGroupId, // person group id
                        params // face ids
                        ,1); // max number of candidates returned

                return results;

            } catch (Exception e)
            {
                return null;
            }
        }

        @Override
        protected void onPreExecute() {
            mDialog.show();
        }

        @Override
        protected void onPostExecute(IdentifyResult[] identifyResults) {
            mDialog.dismiss();
            Log.wtf("Hiep","Length " + identifyResults.length);
            for(IdentifyResult identifyResult:identifyResults)
            {
                if(identifyResult.candidates.size() == 0) {
                    Toast.makeText(MainActivity.this, "Not recognize", Toast.LENGTH_SHORT).show();
                    return;
                }

                new PersonDetectionTask(personGroupId).execute(identifyResult.candidates.get(0).personId,identifyResult.faceId);
            }
        }

        @Override
        protected void onProgressUpdate(String... values) {
            mDialog.setMessage(values[0]);
        }
    }
    private class PersonDetectionTask extends AsyncTask<UUID,String,Person> {
        private ProgressDialog mDialog = new ProgressDialog(MainActivity.this);
        private String personGroupId;
        UUID faceid;
        public PersonDetectionTask(String personGroupId) {
            this.personGroupId = personGroupId;
        }

        @Override
        protected Person doInBackground(UUID... params) {
            try{
                publishProgress("Getting person group status...");
                faceid = params[1];
                return faceServiceClient.getPerson(personGroupId,params[0]);
            } catch (Exception e)
            {
                return null;
            }
        }

        @Override
        protected void onPreExecute() {
            mDialog.show();
        }

        @Override
        protected void onPostExecute(Person person) {
            mDialog.dismiss();
            Toast.makeText(MainActivity.this,person.name,Toast.LENGTH_SHORT).show();
            Log.wtf("Hiep2",person.name);
            ImageView img = (ImageView)findViewById(R.id.imageView1);
            mBitmap = ((BitmapDrawable)img.getDrawable()).getBitmap();
            img.setImageBitmap(drawFaceRectangleOnBitmap(mBitmap,facesDetected,person.name,faceid));
        }

        @Override
        protected void onProgressUpdate(String... values) {
            mDialog.setMessage(values[0]);
        }
    }
    private Bitmap drawFaceRectangleOnBitmap(Bitmap mBitmap, Face[] facesDetected, String name, UUID personID) {

        Bitmap bitmap = mBitmap.copy(Bitmap.Config.ARGB_8888,true);
        Canvas canvas = new Canvas(bitmap);
        //Rectangle
        Paint paint = new Paint();
        paint.setAntiAlias(true);
        paint.setStyle(Paint.Style.STROKE);
        paint.setColor(Color.RED);
        if(facesDetected != null)
        {
            for(Face face:facesDetected)
            {
                paint.setColor(Color.GREEN);
                FaceRectangle faceRectangle = face.faceRectangle;

                paint.setStyle(Paint.Style.STROKE);
                //myPaint.setColor(Color.rgb(0, 0, 0));
                paint.setStrokeWidth(1);
                canvas.drawRect(faceRectangle.left,
                        faceRectangle.top,
                        faceRectangle.left+faceRectangle.width,
                        faceRectangle.top+faceRectangle.height,
                        paint);
                Log.wtf("Hiep","Face" + face.faceId);
                Log.wtf("Hiep","Face2" + personID);
                if(face.faceId.equals(personID))
                    drawTextOnCanvas(canvas,12,faceRectangle.left,faceRectangle.top,Color.RED,name);
                    //drawTextOnCanvas(canvas,12,((faceRectangle.left+faceRectangle.width)/2),(faceRectangle.top+faceRectangle.height),Color.RED,name);
            }
        }
        return bitmap;
    }

    private void drawTextOnCanvas(Canvas canvas, int textSize, int x, int y, int color, String name) {
        Paint paint = new Paint();
        paint.setAntiAlias(true);
        paint.setStyle(Paint.Style.FILL);
        paint.setColor(color);
        paint.setTextSize(textSize);

        float textWidth = paint.measureText(name);

        canvas.drawText(name,x,y-(textSize/2),paint);
    }
}
